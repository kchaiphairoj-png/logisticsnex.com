# 🚀 LogisticsNex — Deployment Guide

คู่มือ deploy ไป `www.logisticsnex.com` แบบ step-by-step สำหรับ first-time setup

---

## 0. สิ่งที่ต้องมีก่อนเริ่ม

| รายการ | หมายเหตุ |
|---|---|
| Domain `logisticsnex.com` | ✅ มีแล้ว |
| GitHub account | สำหรับ push code |
| Vercel account | https://vercel.com (ใช้ GitHub OAuth) |
| Supabase account | https://supabase.com (ฟรี tier ใช้ได้สำหรับเริ่มต้น) |
| OpenAI API key | https://platform.openai.com — เติมเงินเข้าบัญชี $10 ขั้นต่ำ |
| Stripe หรือ Omise account | ถ้าจะรับเงินจริง (สามารถข้ามได้ก่อน) |

---

## 1. สร้าง Supabase project

1. ไปที่ https://supabase.com/dashboard → **New project**
2. เลือก region: **Southeast Asia (Singapore)** — ใกล้ผู้ใช้ไทยที่สุด
3. ตั้งรหัส database password (เก็บไว้ในที่ปลอดภัย)
4. รอ provision เสร็จ (~2 นาที)

### 1.1 รัน migrations

ใน Supabase Studio → **SQL Editor** → New query
รันไฟล์ตามลำดับนี้ (copy เนื้อหาแล้ว run):

```
supabase/migrations/20260526_hs_match.sql    ← RPC สำหรับ HS code vector search
supabase/migrations/20260527_marketplace.sql ← suppliers, products, rfqs, quotes
```

> **TODO ก่อนรัน:** สร้าง tables พื้นฐาน (`organizations`, `documents`, `audit_logs`,
> `hs_code_reference`, etc.) ตาม schema design ที่คุยใน session แรก
> หรือ generate จาก `lib/agents/extractor.ts` + `hs-classifier.ts` schemas

### 1.2 เปิด pgvector

ใน Supabase Studio → **Database** → **Extensions** → enable `vector`

### 1.3 สร้าง Storage bucket

**Storage** → **New bucket** → ชื่อ `documents` → **Private**

### 1.4 เก็บ env vars ที่ต้องใช้

ใน Supabase Studio → **Settings** → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **ลับสุดยอด ห้าม commit**

---

## 2. Seed hs_code_reference (สำคัญสำหรับ HS Classifier)

ตาราง `hs_code_reference` ต้องมีข้อมูล 22,418 พิกัดศุลกากรไทย + embeddings
มิฉะนั้น HS Classifier จะ fall back เป็น LLM-only ที่แม่นยำน้อยกว่า

**วิธีทำ (high level):**
1. ดาวน์โหลด HS Code 2022 จาก https://www.customs.go.th (Excel)
2. เขียน script Node.js ที่:
   - อ่าน Excel
   - generate embedding สำหรับแต่ละแถวด้วย `text-embedding-3-small`
   - insert พร้อม code, description_en, description_th, duty_rate, embedding
3. cost: ~$2 สำหรับ 22,000 rows × ~50 tokens = 1.1M tokens

ติดต่อให้ผมเขียน seed script ให้ได้

---

## 3. ตั้งค่า OpenAI

1. ไปที่ https://platform.openai.com/api-keys → **Create new secret key**
2. ตั้งชื่อ: `logisticsnex-production`
3. เก็บค่าไว้ → `OPENAI_API_KEY`
4. ตั้ง **Usage limit** ใน Billing → Limits — แนะนำเริ่มที่ **$50/เดือน hard limit** กันบัญชีถูก abuse

---

## 4. Push code ไป GitHub

```bash
cd customs-agent
git init
git add .
git commit -m "Initial commit"
gh repo create logisticsnex --private --source=. --push
# หรือสร้าง repo บน github.com แล้ว:
# git remote add origin git@github.com:USERNAME/logisticsnex.git
# git push -u origin main
```

---

## 5. Deploy ไป Vercel

1. ไปที่ https://vercel.com/new
2. **Import Git Repository** → เลือก repo ที่เพิ่งสร้าง
3. **Framework Preset:** Next.js (auto-detected)
4. **Build Command:** `next build` (default)
5. **Root Directory:** `./` (ถ้า monorepo ให้ใส่ path)
6. เพิ่ม **Environment Variables**:

   ```
   NEXT_PUBLIC_SUPABASE_URL          = https://YOUR-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY     = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY         = eyJhbGc...    ⚠ Encrypted
   SUPABASE_DOC_BUCKET               = documents
   OPENAI_API_KEY                    = sk-proj-...   ⚠ Encrypted
   OPENAI_EXTRACT_MODEL              = gpt-4o-2024-08-06
   OPENAI_HS_MODEL                   = gpt-4o-mini-2024-07-18
   OPENAI_MATCHER_MODEL              = gpt-4o-mini-2024-07-18
   EXTRACT_MIN_CONFIDENCE            = 0.60
   EXTRACT_MAX_FILE_BYTES            = 20971520
   EXTRACT_OPENAI_TIMEOUT_MS         = 60000
   NEXT_PUBLIC_APP_URL               = https://www.logisticsnex.com
   ```

7. กด **Deploy** → รอ 1-2 นาที

---

## 6. เชื่อม custom domain

### 6.1 Vercel

1. Vercel project → **Settings** → **Domains**
2. Add `logisticsnex.com` → Add
3. Add `www.logisticsnex.com` → Add (Vercel แนะนำให้ใช้ www เป็น canonical)

### 6.2 DNS ที่ผู้ให้บริการโดเมน (Namecheap/GoDaddy/Cloudflare)

ตั้ง DNS records ตามที่ Vercel แจ้ง (แตกต่างแล้วแต่ provider):

**ถ้าใช้ Cloudflare (แนะนำ — ฟรี + เร็ว):**
```
Type   Name   Value                        Proxy
A      @      76.76.21.21                  DNS only ✓
CNAME  www    cname.vercel-dns.com         DNS only ✓
```

**ถ้าใช้ Namecheap:**
```
Type        Host    Value
A Record    @       76.76.21.21
CNAME       www     cname.vercel-dns.com
```

รอ DNS propagation 5 นาที – 24 ชม. (เช็คที่ https://dnschecker.org)
Vercel auto-provision SSL certificate ผ่าน Let's Encrypt

### 6.3 ตั้ง www เป็น canonical

Vercel project → **Settings** → **Domains** → คลิก `logisticsnex.com` → **Redirect to** `www.logisticsnex.com` (301)

---

## 7. ตั้งค่า email (optional แต่แนะนำ)

ถ้าจะใช้ `hello@logisticsnex.com`:

**ตัวเลือก A — Cloudflare Email Routing (ฟรี):**
1. Cloudflare → Email → Email Routing → Enable
2. Add destination address (Gmail ส่วนตัว)
3. Add route: `hello@logisticsnex.com` → forward to Gmail
4. เพิ่ม MX records ที่ Cloudflare แนะนำ

**ตัวเลือก B — Google Workspace ($6/user/เดือน):**
ใช้ Gmail แบบมือโปร — เหมาะถ้าจะส่งอีเมลแทนรับเฉยๆ

---

## 8. Production smoke test

หลัง deploy ลองทดสอบ:

- [ ] `https://www.logisticsnex.com/` → landing page โหลดได้
- [ ] `https://logisticsnex.com/` → redirect ไป www
- [ ] `https://www.logisticsnex.com/dashboard` → middleware redirect ไป `/sign-in?next=/dashboard`
- [ ] `/sign-in` หน้า login แสดง
- [ ] `/sitemap.xml` ส่งออก XML ถูก
- [ ] `/robots.txt` มีกฎ disallow `/dashboard` etc.
- [ ] OG image: ลอง paste link ไป Facebook/Twitter → ขึ้นภาพ preview สวยๆ
- [ ] Lighthouse score (DevTools → Lighthouse): ตั้ง target ≥ 90 ทุกหัวข้อ
- [ ] Mobile responsive: ทดสอบที่ width 375px

---

## 9. Monitoring + Analytics (แนะนำ install หลัง launch)

### Vercel Analytics (ฟรี + ง่าย)
```bash
npm i @vercel/analytics @vercel/speed-insights
```
เพิ่มใน `app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// ใน <body>:
<Analytics />
<SpeedInsights />
```

### Error tracking — Sentry (ฟรี tier เพียงพอ)
```bash
npx @sentry/wizard@latest -i nextjs
```

### Product analytics — PostHog (ฟรี tier 1M events/เดือน)
ติดตามว่าผู้ใช้ click อะไร, drop off ตรงไหน

---

## 10. Security checklist ก่อน launch จริง

- [ ] หมุน `SUPABASE_SERVICE_ROLE_KEY` หลังการตั้งค่าเสร็จ
- [ ] เปิด **RLS** บนทุก tenant table (มี policies อยู่ใน migrations แล้ว)
- [ ] ตั้ง **Email confirmation** ใน Supabase Auth → Settings (ไม่ให้สมัครมั่ว)
- [ ] เปิด **PITR backup** ใน Supabase (Pro plan $25/เดือน)
- [ ] ตั้ง **OpenAI usage limit** $50-100/เดือนแรก
- [ ] เปิด **Vercel Web Application Firewall** (Pro plan)
- [ ] เขียน **Terms** + **Privacy Policy** + **PDPA notice** — กฎหมาย PDPA ของไทยบังคับ
- [ ] DPA (Data Processing Agreement) ระบุว่าใช้ OpenAI sub-processor
- [ ] เพิ่ม Cookie banner (PDPA + GDPR ถ้ามี EU users)

---

## 11. ปัญหาที่อาจเจอ + วิธีแก้

| อาการ | สาเหตุ | วิธีแก้ |
|---|---|---|
| `/dashboard` redirect loop | Cookie name ไม่ตรง pattern | เช็ค Supabase Auth ใช้ cookie name `sb-{ref}-auth-token` |
| 404 บน `/icon.svg` | Next.js cache | Redeploy without cache ใน Vercel |
| CSP block external script | CSP เข้มไป | แก้ `next.config.js` → เพิ่ม domain ใน `script-src`/`connect-src` |
| OG image ไม่ขึ้นบน Facebook | FB cache เก่า | ใช้ https://developers.facebook.com/tools/debug/ → Scrape Again |
| Slow OpenAI calls | Region ไกล | ใช้ Vercel `regions: ["sin1"]` (มีใน vercel.json แล้ว) |
| `npm run build` fail ใน Vercel | Missing env var | ตรวจ Environment Variables ครบทุกตัวที่ใส่ใน Production scope |

---

## 12. งานที่ยังไม่ได้ทำ (ก่อน launch จริง)

ระบบนี้ปัจจุบันคือ **frontend + AI agents (mocked data)** ก่อนจะรับลูกค้าจริง ต้องเขียนเพิ่ม:

1. **Auth wiring** — เปลี่ยน sign-in/sign-up form ให้เรียก `supabase.auth.*`
2. **Wire dashboard pages กับ Supabase queries** — แทน mock data
3. **Upload flow** — สร้าง presigned URL → upload ตรงสู่ Storage → POST `/api/ai/extract`
4. **Stripe/Omise** webhook + checkout integration
5. **Email transactional** (Resend/Postmark) — สำหรับ verify email, RFQ notification
6. **Supplier onboarding** + verification queue
7. **Chat/messaging** ระหว่าง buyer-supplier
8. **Admin panel** สำหรับ verify suppliers + ดู audit logs

---

## ติดต่อ

ถ้ามีปัญหาระหว่าง deploy:
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- OpenAI structured outputs: https://platform.openai.com/docs/guides/structured-outputs

🎉 ขอให้ launch สำเร็จ!
