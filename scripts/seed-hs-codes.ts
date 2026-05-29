/**
 * HS Code Seed Script
 * ──────────────────────────────────────────────────────────────
 *
 * Loads Thai Customs HS Code (~22,418 rows) from a CSV file,
 * generates embeddings via OpenAI text-embedding-3-small,
 * and inserts into `hs_code_reference`.
 *
 * Cost: ~$2 one-time for full Thai HS book.
 * Time: ~10-15 minutes total (embedding batches of 100).
 *
 * USAGE
 * ──────────────────────────────────────────────────────────────
 * 1. Get the official HS Code book from Thai Customs:
 *    https://www.customs.go.th  → ดาวน์โหลด → Excel
 *
 * 2. Convert Excel → CSV with these columns (in this order):
 *    code, description_en, description_th, duty_rate
 *
 *    e.g. ./data/hs_codes_th.csv
 *
 * 3. Make sure your `.env.local` has:
 *    OPENAI_API_KEY=sk-...
 *    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... or sb_secret_...
 *
 * 4. Install tsx if you haven't: npm i -D tsx
 *
 * 5. Run:
 *    npx tsx scripts/seed-hs-codes.ts ./data/hs_codes_th.csv
 *
 *    Optional flags:
 *      --dry-run        Don't write to DB, just count rows
 *      --skip-existing  Skip codes already in the table (resume)
 *      --batch=100      Embedding batch size (default 100)
 *      --limit=500      Stop after N rows (for testing)
 */

import { config as loadEnv } from "dotenv";
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local" });
} else {
  loadEnv();
}
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// ──────────────────────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const skipExisting = args.includes("--skip-existing");
const batchSize = Number(args.find((a) => a.startsWith("--batch="))?.split("=")[1] ?? 100);
const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? Infinity);

if (!csvPath) {
  console.error("❌ Missing CSV path.\n");
  console.error("Usage: npx tsx scripts/seed-hs-codes.ts ./data/hs_codes_th.csv [--dry-run] [--skip-existing] [--batch=100] [--limit=500]");
  process.exit(1);
}

// ──────────────────────────────────────────────────────────────
// Env
// ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!OPENAI_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ──────────────────────────────────────────────────────────────
// Parse CSV — naive but works for clean Customs exports
// ──────────────────────────────────────────────────────────────

interface HsRow {
  code: string;
  description_en: string;
  description_th: string;
  duty_rate: number | null;
}

function parseCsv(content: string): HsRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].toLowerCase();
  if (!header.includes("code")) {
    throw new Error('First row must be a header containing "code"');
  }

  const rows: HsRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;
    const code = cols[0]?.trim();
    if (!code || !/^\d{4}/.test(code)) continue; // skip junk
    rows.push({
      code: normalizeCode(code),
      description_en: cols[1]?.trim() ?? "",
      description_th: cols[2]?.trim() ?? "",
      duty_rate: parseDuty(cols[3]),
    });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  // Handles simple quoted commas: "foo, bar","baz" → ["foo, bar", "baz"]
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (const c of line) {
    if (c === '"') inQ = !inQ;
    else if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function normalizeCode(raw: string): string {
  // Strip non-digits, then format as XXXX.XX.XX.XXX (Thai 11-digit)
  const d = raw.replace(/\D/g, "");
  if (d.length >= 11) {
    return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}.${d.slice(8, 11)}`;
  }
  if (d.length >= 8) {
    return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
  }
  return raw;
}

function parseDuty(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// ──────────────────────────────────────────────────────────────
// Embedding
// ──────────────────────────────────────────────────────────────

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

function embedText(row: HsRow): string {
  // What we feed the embedder = what we semantic-search later.
  // Include both languages so a Thai query matches an English-only row.
  return [row.code, row.description_en, row.description_th]
    .filter(Boolean)
    .join(" — ");
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

async function main() {
  const fullPath = resolve(csvPath!);
  console.log(`📂 Reading ${fullPath}`);
  const content = readFileSync(fullPath, "utf-8");
  let rows = parseCsv(content);
  console.log(`✓ Parsed ${rows.length} rows`);

  if (limit < rows.length) {
    rows = rows.slice(0, limit);
    console.log(`  (limited to ${rows.length} via --limit)`);
  }

  if (skipExisting) {
    const codes = rows.map((r) => r.code);
    const { data: existing } = await supabase
      .from("hs_code_reference")
      .select("code")
      .in("code", codes);
    const existingSet = new Set((existing ?? []).map((e) => e.code));
    const before = rows.length;
    rows = rows.filter((r) => !existingSet.has(r.code));
    console.log(`  Skipping ${before - rows.length} codes already in DB`);
  }

  if (dryRun) {
    console.log(`🟡 Dry run — would insert ${rows.length} rows. Stopping.`);
    return;
  }

  if (rows.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  console.log(`🚀 Embedding + inserting in batches of ${batchSize}`);
  console.log(`   Estimated cost: $${((rows.length * 50 * 0.02) / 1_000_000).toFixed(3)} USD`);

  let inserted = 0;
  const startedAt = Date.now();

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const texts = batch.map(embedText);

    let embeddings: number[][];
    try {
      embeddings = await embedBatch(texts);
    } catch (err) {
      console.error(`  ✗ Embedding failed for batch ${i}-${i + batchSize}:`, (err as Error).message);
      console.error(`    Retrying in 5s...`);
      await sleep(5000);
      embeddings = await embedBatch(texts);
    }

    const payload = batch.map((row, j) => ({
      code: row.code,
      description_en: row.description_en,
      description_th: row.description_th || null,
      duty_rate: row.duty_rate,
      vat_rate: 7.0,
      embedding: embeddings[j],
    }));

    const { error } = await supabase
      .from("hs_code_reference")
      .upsert(payload, { onConflict: "code" });

    if (error) {
      console.error(`  ✗ Insert failed for batch ${i}-${i + batchSize}:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
    const pct = ((inserted / rows.length) * 100).toFixed(1);
    console.log(`  ✓ ${inserted}/${rows.length} (${pct}%) · ${elapsed}s`);
  }

  console.log(`\n🎉 Done. Inserted ${inserted} HS codes.`);
  console.log(`   Total time: ${((Date.now() - startedAt) / 1000).toFixed(0)}s`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("\n💥 Fatal:", err);
  process.exit(1);
});
