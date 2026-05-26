# LogisticsNex

AI Trade Platform สำหรับ SME ไทย — จัดการเอกสารนำเข้า-ส่งออก, วิเคราะห์ HS Code,
และ B2B Marketplace พร้อม Form E matching ในระบบเดียว

🌐 https://www.logisticsnex.com

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind**
- **Supabase** (Postgres + Auth + Storage + Realtime + pgvector)
- **OpenAI** (GPT-4o vision + GPT-4o-mini + text-embedding-3-small)
- **shadcn/ui-style** components (no Radix dependency on most primitives)

## Quick start

```bash
npm install
cp .env.example .env.local
# กรอก env vars ใน .env.local (ดู .env.example)
npm run dev
```

เปิด http://localhost:3000

## Project structure

```
app/
├── (auth)/              สำคัญ: layout แยกจาก dashboard
│   ├── sign-in/         /sign-in
│   └── sign-up/         /sign-up
├── (dashboard)/         layout มี sidebar + topbar
│   ├── dashboard/       /dashboard (app home)
│   ├── upload/          /upload
│   ├── analysis/        /analysis (list) + /analysis/[id]
│   ├── marketplace/     /marketplace + /marketplace/rfq/* + /marketplace/suppliers/*
│   ├── billing/         /billing
│   ├── settings/        /settings (5 tabs)
│   └── account/         /account (4 tabs)
├── api/ai/              AI agent endpoints
│   ├── extract/         POST → Extractor Agent
│   ├── hs-code/         POST → HS Classifier
│   └── match-suppliers/ POST → Supplier Matcher
├── page.tsx             /  (public landing)
├── layout.tsx           root layout + metadata
├── opengraph-image.tsx  dynamic OG image (1200×630)
├── icon.svg             favicon
├── manifest.ts          PWA manifest
├── robots.ts            SEO crawler rules
├── sitemap.ts           SEO sitemap
├── error.tsx            global error boundary
├── not-found.tsx        404 page
└── loading.tsx          global loading state

lib/
├── agents/              AI agents (pure functions)
│   ├── extractor.ts     Invoice → JSON (vision)
│   ├── hs-classifier.ts Description → HS code (RAG + LLM)
│   └── supplier-matcher.ts  Buyer intent → ranked suppliers (RAG + LLM)
├── openai.ts            OpenAI client
├── supabase-admin.ts    Service-role Supabase client (server-only)
├── utils.ts             cn(), formatTHB(), formatDateTH()
└── marketplace-data.ts  Mock data for UI (replace with Supabase queries)

components/
├── ui/                  shadcn primitives (Button, Card, Table, Tabs, ...)
├── dashboard/           Dashboard-specific (Sidebar, Topbar, SummaryCards, ...)
└── marketplace/         Marketplace cards (SupplierCard, ProductCard)

supabase/
└── migrations/          SQL files for vector RPCs + marketplace tables

middleware.ts            Route protection (auth gating)
next.config.js           Security headers + CSP + redirects
vercel.json              Region pinning (sin1) + function memory
```

## AI agents

3 agents ที่ทำงานเป็น pipeline:

```
Invoice/PDF
    │
    ▼
[1] Extractor Agent       → JSON: shipper, consignee, items[]
    │ (gpt-4o vision)
    ▼
[2] HS Classifier         → JSON: hs_code, duty_rate, FTA options, alternatives
    │ (embedding + RAG + gpt-4o-mini)
    ▼
[3] Supplier Matcher      → JSON: ranked suppliers with match_score
    (embedding + RAG + gpt-4o-mini)
```

แต่ละ agent return discriminated union:
`{ status: "success" | "failed_to_parse" | "needs_review", ... }`

## Deployment

ดู [DEPLOY.md](./DEPLOY.md) สำหรับ step-by-step guide

## License

Proprietary © LogisticsNex Co., Ltd.
