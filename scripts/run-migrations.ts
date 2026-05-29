/**
 * Supabase migration runner.
 *
 * Reads .env.local for SUPABASE_DB_URL (Transaction pooler), then runs
 * every *.sql file in supabase/migrations/ in alphabetical order.
 *
 * Idempotent: uses `create table ... if not exists` patterns where possible;
 * other DDL is wrapped so the script tolerates re-runs.
 *
 * Usage:
 *   npm run migrate          # run all
 *   npm run migrate -- --check  # don't apply, just list what would run
 */
import { config as loadEnv } from "dotenv";
import { readFileSync, readdirSync, existsSync } from "node:fs";

// Load .env.local first (Next.js convention), fall back to .env
if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local" });
} else {
  loadEnv();
}
import { resolve, join } from "node:path";
import { Client } from "pg";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const verbose = args.includes("--verbose");

const MIGRATIONS_DIR = resolve(__dirname, "..", "supabase", "migrations");
// Two ways to configure:
//   1. SUPABASE_DB_URL (one connection string — password must be URL-encoded)
//   2. SUPABASE_DB_HOST + SUPABASE_DB_USER + SUPABASE_DB_PASSWORD (separate — password literal)
// Option 2 is safer because passwords often contain @, :, /, etc.
const DB_URL = process.env.SUPABASE_DB_URL;
const DB_HOST = process.env.SUPABASE_DB_HOST;
const DB_PORT = process.env.SUPABASE_DB_PORT ?? "6543";
const DB_USER = process.env.SUPABASE_DB_USER;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const DB_NAME = process.env.SUPABASE_DB_NAME ?? "postgres";

function buildConnectionConfig() {
  if (DB_HOST && DB_USER && DB_PASSWORD) {
    return {
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: { rejectUnauthorized: false },
    };
  }
  if (DB_URL) {
    return {
      connectionString: DB_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  console.error("❌ No DB credentials set in .env.local");
  console.error("");
  console.error("Option A — split into separate vars (recommended, no URL-encoding issues):");
  console.error("   SUPABASE_DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com");
  console.error("   SUPABASE_DB_PORT=6543");
  console.error("   SUPABASE_DB_USER=postgres.geqcwszjrerbgmdewvrn");
  console.error("   SUPABASE_DB_PASSWORD=YourPassword");
  console.error("");
  console.error("Option B — single connection string (URL-encode special chars in password):");
  console.error("   SUPABASE_DB_URL=postgresql://postgres.{ref}:{password}@aws-1-{region}.pooler.supabase.com:6543/postgres");
  process.exit(1);
}

const connectionConfig = buildConnectionConfig();

interface MigrationFile {
  name: string;
  path: string;
  size: number;
}

function listMigrations(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.map((name) => {
    const path = join(MIGRATIONS_DIR, name);
    const content = readFileSync(path, "utf-8");
    return { name, path, size: content.length };
  });
}

async function main() {
  const migrations = listMigrations();

  console.log(`📂 Found ${migrations.length} migration file(s):`);
  for (const m of migrations) {
    console.log(`   · ${m.name}  (${(m.size / 1024).toFixed(1)} KB)`);
  }
  console.log();

  if (checkOnly) {
    console.log("🟡 --check mode: not applying. Stopping.");
    return;
  }

  console.log("🔌 Connecting to Supabase Postgres...");
  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log("   ✓ Connected\n");
  } catch (err) {
    console.error("❌ Connection failed:", (err as Error).message);
    console.error("\nCheck that SUPABASE_DB_URL is correct (port 6543, password unescaped).");
    process.exit(1);
  }

  // Create a tiny tracking table so we don't double-apply migrations
  await client.query(`
    create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz default now(),
      checksum text
    )
  `);

  const { rows: applied } = await client.query<{ name: string }>(
    "select name from _migrations order by name"
  );
  const appliedSet = new Set(applied.map((a) => a.name));

  let ranCount = 0;
  let skippedCount = 0;

  for (const m of migrations) {
    if (appliedSet.has(m.name)) {
      console.log(`⏭  ${m.name}  (already applied)`);
      skippedCount++;
      continue;
    }

    console.log(`▶  ${m.name}  ...`);
    const sql = readFileSync(m.path, "utf-8");
    const startedAt = Date.now();

    try {
      // Run the whole file as one batch — Postgres allows multiple statements
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into _migrations (name) values ($1) on conflict (name) do nothing",
        [m.name]
      );
      await client.query("commit");

      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.log(`   ✓ Applied in ${elapsed}s\n`);
      ranCount++;
    } catch (err) {
      await client.query("rollback");
      console.error(`   ✗ Failed: ${(err as Error).message}`);
      if (verbose) {
        console.error("\nFull SQL that failed:");
        console.error(sql.slice(0, 500) + "...");
      }
      console.error("\n💥 Migration halted. Fix the error above and re-run.");
      await client.end();
      process.exit(1);
    }
  }

  // Verify the expected tables exist
  console.log("🔎 Verifying schema...");
  const expectedTables = [
    "organizations",
    "user_profiles",
    "organization_members",
    "subscription_plans",
    "subscriptions",
    "usage_counters",
    "documents",
    "document_items",
    "hs_code_reference",
    "hs_code_logs",
    "audit_logs",
    "suppliers",
    "supplier_products",
    "rfqs",
    "quotes",
    "supplier_reviews",
    "supplier_match_logs",
  ];

  const { rows: tables } = await client.query<{ tablename: string }>(
    `select tablename from pg_tables where schemaname = 'public' and tablename = any($1)`,
    [expectedTables]
  );
  const tableSet = new Set(tables.map((t) => t.tablename));

  const missing = expectedTables.filter((t) => !tableSet.has(t));
  if (missing.length) {
    console.log(`   ⚠ Missing tables: ${missing.join(", ")}`);
  } else {
    console.log(`   ✓ All ${expectedTables.length} expected tables present`);
  }

  // Quick sanity: row counts for the seed data
  const { rows: planCount } = await client.query<{ count: string }>(
    "select count(*)::text as count from subscription_plans"
  );
  console.log(`   ✓ subscription_plans seeded: ${planCount[0].count} rows`);

  await client.end();

  console.log(`\n🎉 Done. ${ranCount} applied, ${skippedCount} skipped.`);
}

main().catch((err) => {
  console.error("\n💥 Fatal:", err);
  process.exit(1);
});
