"use client";
import * as React from "react";
import Link from "next/link";
import { Sparkles, Search, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

/**
 * AI-matcher hero for /marketplace.
 *
 * For now, "AI Match" sends the free-text query as URL params to the RFQ
 * creation form (the buyer can refine + post the RFQ → AI matches suppliers
 * via /api/ai/match-suppliers when the supplier-matcher endpoint is wired
 * to populate quotes). This is the simplest 1-click path until we expose
 * an inline match endpoint.
 */
export function MarketplaceHero() {
  const [query, setQuery] = React.useState("");
  const [origin, setOrigin] = React.useState("any");
  const [requireFormE, setRequireFormE] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  const buildRfqUrl = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("desc", query.trim());
    if (origin !== "any") params.set("origin", origin);
    if (requireFormE) params.set("form_e", "1");
    const qs = params.toString();
    return `/marketplace/rfq/new${qs ? `?${qs}` : ""}`;
  };

  const examples = [
    "เซรั่มวิตามินซี 3000 ชิ้น GMP",
    "เสื้อยืดคอตตอน 500 ตัว",
    "เครื่องฟอกอากาศ Tuya 100 เครื่อง",
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-blue-600/15 via-card to-card p-6 lg:p-8">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          AI Matching for Thai SMEs
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
          หา supplier ที่ <span className="text-primary">ใช่</span> ใน 10 วินาที
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          พิมพ์สิ่งที่คุณต้องการเป็นภาษาไทยปกติ — AI จะหา supplier ที่ตรงสเปก
          มี Form E พร้อม, ส่งของไปไทยทันเวลา, และคำนวณภาษีที่จะประหยัดได้ให้
        </p>

        {/* Search */}
        <form
          action={buildRfqUrl()}
          method="get"
          onSubmit={() => setSearching(true)}
          className="mt-6 rounded-xl border border-border bg-card/80 p-3 backdrop-blur"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="desc"
                placeholder='เช่น "อินเวอร์เตอร์ 5kW จำนวน 50 ตัว ราคา 800$ ต้องการ Form E"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 border-0 bg-transparent pl-9 text-sm focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                name="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-11 w-32 text-xs"
              >
                <option value="any">ทุกประเทศ</option>
                <option value="CN">🇨🇳 จีน</option>
                <option value="VN">🇻🇳 เวียดนาม</option>
                <option value="KR">🇰🇷 เกาหลี</option>
                <option value="JP">🇯🇵 ญี่ปุ่น</option>
                <option value="IN">🇮🇳 อินเดีย</option>
              </Select>
              <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3 cursor-pointer hover:bg-accent">
                <input
                  type="checkbox"
                  name="form_e"
                  checked={requireFormE}
                  onChange={(e) => setRequireFormE(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                <span className="text-xs">มี Form E</span>
              </label>
              <Button
                type="submit"
                disabled={searching || !query.trim()}
                size="lg"
                className="h-11"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังเปิดฟอร์ม...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI Match
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example queries */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted-foreground">ตัวอย่าง:</span>
            {examples.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-[11px] hover:bg-accent"
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
