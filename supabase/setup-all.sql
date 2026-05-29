-- ════════════════════════════════════════════════════════════════
-- LogisticsNex — Complete Database Setup (v2 — Supabase-friendly)
-- ════════════════════════════════════════════════════════════════
-- Run this ONCE in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/_/sql/new
--
-- Safe to re-run — drops + recreates everything cleanly.
-- Does NOT touch the `auth` schema (no triggers on auth.users).
-- ════════════════════════════════════════════════════════════════

-- ─── RESET (drop everything from previous runs) ───────────────
-- Order matters because of foreign keys. Safe — only my tables.
drop table if exists supplier_match_logs cascade;
drop table if exists supplier_reviews cascade;
drop table if exists quotes cascade;
drop table if exists rfqs cascade;
drop table if exists supplier_products cascade;
drop table if exists suppliers cascade;
drop table if exists audit_logs cascade;
drop table if exists hs_code_logs cascade;
drop table if exists hs_code_reference cascade;
drop table if exists document_items cascade;
drop table if exists documents cascade;
drop table if exists usage_counters cascade;
drop table if exists subscriptions cascade;
drop table if exists subscription_plans cascade;
drop table if exists organization_members cascade;
drop table if exists user_profiles cascade;
drop table if exists organizations cascade;
drop function if exists public.user_org_ids() cascade;
drop function if exists public.bootstrap_org_for_user(uuid, text, text, text) cascade;
drop function if exists public.match_hs_codes(vector, int, text) cascade;
drop function if exists public.match_suppliers(vector, int, text, boolean) cascade;
drop function if exists public.match_supplier_products(vector, int, text) cascade;
drop function if exists public.increment_usage(uuid, int, int, bigint) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists auth.user_org_ids() cascade;  -- in case it was created in older run

-- ════════════════════════════════════════════════════════════════
-- PART 1: Base schema
-- ════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- LogisticsNex — Base schema
-- Run this FIRST before 20260526_hs_match.sql and 20260527_marketplace.sql
-- ──────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists vector;        -- pgvector for embeddings
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists pg_trgm;       -- fuzzy text search

-- ──────────────────────────────────────────────────────────────
-- 1. ORGANIZATIONS (multi-tenant root)
-- ──────────────────────────────────────────────────────────────
create table organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  tax_id          text,                                  -- เลขประจำตัวผู้เสียภาษี 13 หลัก
  country         text default 'TH',
  billing_email   text not null,
  logo_url        text,
  status          text not null default 'trial'
                  check (status in ('active','suspended','trial','cancelled')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_org_slug on organizations(slug);

-- ──────────────────────────────────────────────────────────────
-- 2. USER PROFILES (extends auth.users)
-- ──────────────────────────────────────────────────────────────
create table user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  avatar_url      text,
  default_org_id  uuid references organizations(id) on delete set null,
  locale          text default 'th',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Bootstrap a personal organization for a new user.
-- Called by the app immediately after sign-up (since recent Supabase
-- restricts triggers on auth.users from user-level SQL Editor).
-- Idempotent — safe to call multiple times for the same user.
create or replace function public.bootstrap_org_for_user(
  p_user_id uuid,
  p_email text,
  p_full_name text default null,
  p_company_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- Skip if profile already exists (user already onboarded)
  if exists (select 1 from user_profiles where id = p_user_id) then
    return (select default_org_id from user_profiles where id = p_user_id);
  end if;

  insert into organizations (name, slug, billing_email, status)
  values (
    coalesce(p_company_name, split_part(p_email, '@', 1)),
    lower(split_part(p_email, '@', 1)) || '-' || substr(md5(random()::text), 0, 7),
    p_email,
    'trial'
  )
  returning id into new_org_id;

  insert into user_profiles (id, full_name, default_org_id)
  values (p_user_id, coalesce(p_full_name, split_part(p_email, '@', 1)), new_org_id);

  insert into organization_members (org_id, user_id, role)
  values (new_org_id, p_user_id, 'owner');

  return new_org_id;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. ORGANIZATION MEMBERS (M:N with roles)
-- ──────────────────────────────────────────────────────────────
create table organization_members (
  org_id          uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member'
                  check (role in ('owner','admin','member','viewer')),
  invited_by      uuid references auth.users(id),
  joined_at       timestamptz default now(),
  primary key (org_id, user_id)
);

create index idx_member_user on organization_members(user_id);

-- NOTE: Triggers on auth.users require Supabase service-role permission
-- which is not available from the SQL Editor on free/pro plans. Instead,
-- the Next.js app calls public.bootstrap_org_for_user() right after a
-- successful sign-up. See app/(auth)/sign-up/page.tsx.

-- ──────────────────────────────────────────────────────────────
-- 4. SUBSCRIPTION PLANS + SUBSCRIPTIONS
-- ──────────────────────────────────────────────────────────────
create table subscription_plans (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  name            text not null,
  price_thb       numeric(10,2) not null,
  billing_cycle   text not null check (billing_cycle in ('monthly','yearly')),
  doc_quota       int not null,
  hs_lookup_quota int not null,
  features        jsonb default '{}'::jsonb,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- Seed the 3 plans displayed in /billing UI
insert into subscription_plans (code, name, price_thb, billing_cycle, doc_quota, hs_lookup_quota, features) values
  ('starter_m',   'Starter',      990,   'monthly', 50,   200,   '{"team_seats":2}'),
  ('starter_y',   'Starter',      9900,  'yearly',  50,   200,   '{"team_seats":2}'),
  ('pro_m',       'Professional', 2990,  'monthly', 500,  2000,  '{"team_seats":10,"api_access":true,"marketplace":true}'),
  ('pro_y',       'Professional', 29900, 'yearly',  500,  2000,  '{"team_seats":10,"api_access":true,"marketplace":true}'),
  ('ent_m',       'Enterprise',   9990,  'monthly', -1,   -1,    '{"team_seats":-1,"api_access":true,"marketplace":true,"sla":"99.9%"}'),
  ('ent_y',       'Enterprise',   99900, 'yearly',  -1,   -1,    '{"team_seats":-1,"api_access":true,"marketplace":true,"sla":"99.9%"}');

create table subscriptions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  plan_id         uuid not null references subscription_plans(id),
  status          text not null check (status in ('trialing','active','past_due','cancelled')),
  current_period_start  timestamptz not null,
  current_period_end    timestamptz not null,
  cancel_at_period_end  boolean default false,
  stripe_subscription_id text,
  created_at      timestamptz default now()
);

create index idx_sub_org on subscriptions(org_id);

-- ──────────────────────────────────────────────────────────────
-- 5. USAGE COUNTERS (monthly buckets)
-- ──────────────────────────────────────────────────────────────
create table usage_counters (
  org_id          uuid not null references organizations(id) on delete cascade,
  period_start    date not null,
  docs_processed  int default 0,
  hs_lookups      int default 0,
  ai_tokens_used  bigint default 0,
  primary key (org_id, period_start)
);

-- ──────────────────────────────────────────────────────────────
-- 6. DOCUMENTS (Invoice / Packing List / B-L)
-- ──────────────────────────────────────────────────────────────
create table documents (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  uploaded_by     uuid not null references auth.users(id),
  doc_type        text not null check (doc_type in ('invoice','packing_list','bl','awb','other')),
  doc_number      text,
  issue_date      date,
  supplier_name   text,
  buyer_name      text,
  incoterm        text,
  currency        text default 'USD',
  total_amount    numeric(14,2),
  origin_country  text,
  dest_country    text default 'TH',
  storage_path    text not null,
  file_hash       text,
  ocr_status      text default 'pending'
                  check (ocr_status in ('pending','processing','done','failed')),
  ocr_confidence  numeric(4,3),
  raw_extraction  jsonb,
  notes           text,
  deleted_at      timestamptz,                          -- soft delete for PDPA
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_doc_org_created on documents(org_id, created_at desc);
create index idx_doc_hash on documents(org_id, file_hash);
create index idx_doc_status on documents(org_id, ocr_status);

-- ──────────────────────────────────────────────────────────────
-- 7. DOCUMENT ITEMS (line items extracted from invoices)
-- ──────────────────────────────────────────────────────────────
create table document_items (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  org_id          uuid not null references organizations(id) on delete cascade,
  line_no         int,
  description     text not null,
  description_th  text,
  qty             numeric(14,3),
  unit            text,
  unit_price      numeric(14,4),
  amount          numeric(14,2),
  net_weight_kg   numeric(12,3),
  gross_weight_kg numeric(12,3),
  hs_code         text,
  hs_confidence   numeric(4,3),
  country_of_origin text,
  verified_by_user boolean default false,
  created_at      timestamptz default now()
);

create index idx_item_doc on document_items(document_id);
create index idx_item_org on document_items(org_id);

-- ──────────────────────────────────────────────────────────────
-- 8. HS CODE REFERENCE (22,418 Thai customs codes — seed separately)
-- ──────────────────────────────────────────────────────────────
create table hs_code_reference (
  code            text primary key,                     -- '8504.40.90.000'
  description_en  text not null,
  description_th  text,
  chapter         text generated always as (left(code, 2)) stored,
  duty_rate       numeric(6,3),                         -- MFN duty %
  vat_rate        numeric(6,3) default 7.0,
  excise_rate     numeric(6,3),
  embedding       vector(1536),                         -- text-embedding-3-small
  updated_at      timestamptz default now()
);

create index idx_hs_chapter on hs_code_reference(chapter);
create index idx_hs_embedding on hs_code_reference
  using hnsw (embedding vector_cosine_ops);

-- ──────────────────────────────────────────────────────────────
-- 9. HS CODE LOGS (AI classification audit trail)
-- ──────────────────────────────────────────────────────────────
create table hs_code_logs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  document_item_id uuid references document_items(id) on delete set null,
  user_id         uuid references auth.users(id),
  input_text      text not null,
  suggested_codes jsonb not null,
  selected_code   text,
  model_used      text,
  prompt_tokens   int,
  completion_tokens int,
  latency_ms      int,
  feedback        text check (feedback in ('correct','incorrect','partial')),
  created_at      timestamptz default now()
);

create index idx_hslog_org_time on hs_code_logs(org_id, created_at desc);

-- ──────────────────────────────────────────────────────────────
-- 10. AUDIT LOGS (immutable security trail)
-- ──────────────────────────────────────────────────────────────
create table audit_logs (
  id              bigserial primary key,
  org_id          uuid references organizations(id) on delete cascade,
  actor_id        uuid references auth.users(id),
  actor_email     text,
  action          text not null,
  resource_type   text,
  resource_id     uuid,
  ip_address      inet,
  user_agent      text,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);

create index idx_audit_org_time on audit_logs(org_id, created_at desc);
create index idx_audit_actor on audit_logs(actor_id, created_at desc);

-- ──────────────────────────────────────────────────────────────
-- 11. RLS HELPER FUNCTION
-- ──────────────────────────────────────────────────────────────
create or replace function public.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from organization_members
  where user_id = auth.uid();
$$;

-- Allow authenticated users to call it from RLS
grant execute on function public.user_org_ids() to authenticated, anon;

-- ──────────────────────────────────────────────────────────────
-- 12. RLS POLICIES
-- ──────────────────────────────────────────────────────────────
alter table organizations          enable row level security;
alter table user_profiles          enable row level security;
alter table organization_members   enable row level security;
alter table subscription_plans     enable row level security;
alter table subscriptions          enable row level security;
alter table usage_counters         enable row level security;
alter table documents              enable row level security;
alter table document_items         enable row level security;
alter table hs_code_reference      enable row level security;
alter table hs_code_logs           enable row level security;
alter table audit_logs             enable row level security;

-- organizations: members can read their orgs
create policy "members read org" on organizations for select
  using (id in (select public.user_org_ids()));
create policy "owners update org" on organizations for update
  using (
    exists (
      select 1 from organization_members m
      where m.org_id = organizations.id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- user_profiles: read own + same-org members
create policy "read own profile" on user_profiles for select
  using (
    id = auth.uid()
    or default_org_id in (select public.user_org_ids())
  );
create policy "update own profile" on user_profiles for update
  using (id = auth.uid());

-- organization_members: read members of orgs you belong to
create policy "read org members" on organization_members for select
  using (org_id in (select public.user_org_ids()));
create policy "admins manage members" on organization_members for all
  using (
    exists (
      select 1 from organization_members m
      where m.org_id = organization_members.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- subscription_plans: PUBLIC read (the pricing page shows these to anonymous users)
create policy "anyone read plans" on subscription_plans for select using (true);

-- subscriptions / usage_counters: org-scoped
create policy "org members read subscription" on subscriptions for select
  using (org_id in (select public.user_org_ids()));
create policy "org members read usage" on usage_counters for select
  using (org_id in (select public.user_org_ids()));

-- documents
create policy "members read org documents" on documents for select
  using (
    org_id in (select public.user_org_ids())
    and deleted_at is null
  );
create policy "members insert org documents" on documents for insert
  with check (
    org_id in (select public.user_org_ids())
    and uploaded_by = auth.uid()
  );
create policy "members update org documents" on documents for update
  using (org_id in (select public.user_org_ids()));
create policy "admins delete documents" on documents for delete
  using (
    exists (
      select 1 from organization_members m
      where m.org_id = documents.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- document_items
create policy "members read org items" on document_items for select
  using (org_id in (select public.user_org_ids()));
create policy "members write org items" on document_items for all
  using (org_id in (select public.user_org_ids()));

-- hs_code_reference: PUBLIC read (shared knowledge base)
create policy "anyone read hs codes" on hs_code_reference for select using (true);

-- hs_code_logs
create policy "members read org hslogs" on hs_code_logs for select
  using (org_id in (select public.user_org_ids()));

-- audit_logs: read-only for admins/owners (no insert via API — server-side service role only)
create policy "admins read audit" on audit_logs for select
  using (
    exists (
      select 1 from organization_members m
      where m.org_id = audit_logs.org_id
        and m.user_id = auth.uid()
        and m.role in ('owner','admin')
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 13. STORAGE BUCKET (run separately in Storage UI or via SQL below)
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies: org members can read/write their own folder
create policy "org members read documents bucket"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      -- path layout: {org_id}/{yyyy}/{mm}/{file}.pdf
      (storage.foldername(name))[1]::uuid in (select public.user_org_ids())
    )
  );

create policy "org members upload documents bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (select public.user_org_ids())
    and auth.role() = 'authenticated'
  );

-- ──────────────────────────────────────────────────────────────
-- DONE.
-- Next migrations:
--   20260526_hs_match.sql    (RPC: match_hs_codes, increment_usage)
--   20260527_marketplace.sql (suppliers, products, rfqs, quotes)
-- ──────────────────────────────────────────────────────────────

-- ════════════════════════════════════════════════════════════════
-- PART 2: HS Code RPCs
-- ════════════════════════════════════════════════════════════════

-- Vector similarity RPC used by the HS Classifier agent.
-- Requires: extension `vector`, table `hs_code_reference` with HNSW index.

create or replace function match_hs_codes(
  query_embedding vector(1536),
  match_count int default 10,
  -- Optional filter to narrow to a single HS chapter (2-digit prefix).
  -- Speeds search and stops cross-chapter false positives.
  chapter_filter text default null
)
returns table (
  code text,
  description_en text,
  description_th text,
  duty_rate numeric,
  vat_rate numeric,
  excise_rate numeric,
  similarity float
)
language sql
stable
as $$
  select
    h.code,
    h.description_en,
    h.description_th,
    h.duty_rate,
    h.vat_rate,
    h.excise_rate,
    1 - (h.embedding <=> query_embedding) as similarity
  from hs_code_reference h
  where
    chapter_filter is null
    or left(h.code, 2) = chapter_filter
  order by h.embedding <=> query_embedding
  limit match_count;
$$;

-- Atomic usage counter used by the route handlers.
-- Called whenever we burn AI credits.
create or replace function increment_usage(
  p_org_id uuid,
  p_docs int default 0,
  p_hs_lookups int default 0,
  p_tokens bigint default 0
)
returns void
language sql
as $$
  insert into usage_counters (org_id, period_start, docs_processed, hs_lookups, ai_tokens_used)
  values (
    p_org_id,
    date_trunc('month', now())::date,
    p_docs,
    p_hs_lookups,
    p_tokens
  )
  on conflict (org_id, period_start) do update set
    docs_processed = usage_counters.docs_processed + excluded.docs_processed,
    hs_lookups     = usage_counters.hs_lookups     + excluded.hs_lookups,
    ai_tokens_used = usage_counters.ai_tokens_used + excluded.ai_tokens_used;
$$;

-- ════════════════════════════════════════════════════════════════
-- PART 3: B2B Marketplace
-- ════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- B2B Marketplace + Matching
-- ─────────────────────────────────────────────────────────────

-- Suppliers (manufacturers/exporters in CN, VN, KR, etc.)
create table suppliers (
  id              uuid primary key default gen_random_uuid(),
  legal_name      text not null,                  -- 营业执照 name
  trade_name      text not null,                  -- Brand / common name
  country         text not null,                  -- ISO 3166 alpha-2
  city            text,
  established_year int,
  staff_count     int,
  factory_size_sqm int,
  business_license_no text,                       -- 统一社会信用代码 / equivalent

  -- Verification (Alibaba-style trust signals)
  is_verified     boolean default false,          -- license + factory audit done
  verified_at     timestamptz,
  verified_by     text,                           -- "SGS", "BV", "in-house"
  trade_assurance boolean default false,          -- escrow available
  response_rate   numeric(5,2),                   -- % messages answered <24h
  response_hours_avg int,
  on_time_delivery_rate numeric(5,2),

  -- Trade data
  main_categories text[] not null default '{}',   -- HS chapter codes
  main_markets    text[] not null default '{}',   -- ISO country codes
  export_volume_usd_yearly numeric(14,2),         -- self-declared

  -- FTA support
  supports_form_e boolean default false,          -- CN→TH (ACFTA)
  supports_form_aj boolean default false,         -- JP→TH (AJCEP)
  supports_form_ak boolean default false,         -- KR→TH (AKFTA)
  supports_form_d  boolean default false,         -- ASEAN→TH (ATIGA)
  supports_form_rcep boolean default false,

  -- Contact
  contact_name    text,
  wechat_id       text,                           -- still essential for CN
  whatsapp        text,
  email           text,
  website         text,
  logo_url        text,
  banner_url      text,

  rating          numeric(3,2),                   -- 1.00 .. 5.00
  review_count    int default 0,

  -- For embedding-based discovery
  embedding       vector(1536),

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_supplier_country on suppliers(country);
create index idx_supplier_verified on suppliers(is_verified) where is_verified = true;
create index idx_supplier_categories on suppliers using gin(main_categories);
create index idx_supplier_embedding on suppliers
  using hnsw (embedding vector_cosine_ops);

-- ─────────────────────────────────────────────────────────────
-- Supplier products (their catalog)
create table supplier_products (
  id              uuid primary key default gen_random_uuid(),
  supplier_id     uuid not null references suppliers(id) on delete cascade,

  name_en         text not null,
  name_th         text,                           -- AI-translated
  description     text,
  category        text,                           -- free-text or taxonomy
  hs_code         text,                           -- pre-classified by our HS Agent
  hs_confidence   numeric(4,3),

  -- Pricing
  moq             int not null,                   -- minimum order quantity
  moq_unit        text not null default 'pcs',
  price_min_usd   numeric(10,2),
  price_max_usd   numeric(10,2),
  price_unit      text not null default 'pcs',
  payment_terms   text[] default '{TT,LC}',       -- TT, LC, OA, PayPal, ...

  -- Logistics
  lead_time_days_min int,
  lead_time_days_max int,
  ships_from_port text,                           -- e.g. "CNSHA Shanghai"
  hs_form_eligible text[] default '{}',           -- ['Form E', 'Form RCEP']

  -- Media
  image_urls      text[] default '{}',
  spec_pdf_url    text,

  -- Compliance
  certifications  text[] default '{}',            -- CE, FCC, RoHS, etc.
  has_brand_authorization boolean default false,

  -- Discovery
  embedding       vector(1536),
  total_sold_units int default 0,
  view_count      int default 0,

  is_active       boolean default true,
  created_at      timestamptz default now()
);

create index idx_product_supplier on supplier_products(supplier_id);
create index idx_product_hs on supplier_products(hs_code);
create index idx_product_embedding on supplier_products
  using hnsw (embedding vector_cosine_ops);

-- ─────────────────────────────────────────────────────────────
-- Buyer RFQs (Request for Quote) — Thai SMEs post these
create table rfqs (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  created_by      uuid not null references auth.users(id),

  title           text not null,
  description     text not null,
  category        text,
  hs_code_hint    text,                           -- if buyer already knows

  quantity        int not null,
  quantity_unit   text not null default 'pcs',
  target_price_usd numeric(10,2),
  currency        text default 'USD',

  -- Buyer requirements
  preferred_origin text[] default '{CN}',         -- ISO country codes
  required_certifications text[] default '{}',    -- CE, FDA, RoHS, ...
  required_form_e boolean default false,          -- Thai buyer specific
  required_form_rcep boolean default false,
  delivery_incoterm text default 'CIF',
  delivery_port   text default 'THBKK',           -- Bangkok by default
  needed_by_date  date,
  sample_required boolean default true,

  status          text not null default 'open'
                  check (status in ('draft','open','closed','awarded','cancelled')),
  expires_at      timestamptz,
  awarded_quote_id uuid,                          -- FK set after awarding

  embedding       vector(1536),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_rfq_org on rfqs(org_id, created_at desc);
create index idx_rfq_status on rfqs(status) where status = 'open';
create index idx_rfq_embedding on rfqs using hnsw (embedding vector_cosine_ops);

-- ─────────────────────────────────────────────────────────────
-- Supplier quotes (responses to RFQs)
create table quotes (
  id              uuid primary key default gen_random_uuid(),
  rfq_id          uuid not null references rfqs(id) on delete cascade,
  supplier_id     uuid not null references suppliers(id),

  -- Pricing
  unit_price_usd  numeric(10,2) not null,
  total_price_usd numeric(12,2) not null,
  moq             int not null,

  -- Delivery
  lead_time_days  int not null,
  incoterm        text not null,
  ships_from_port text,

  -- Compliance
  offers_form_e   boolean default false,
  offers_form_rcep boolean default false,
  certifications  text[] default '{}',

  -- Quote body
  message         text,
  attachments     text[] default '{}',           -- spec sheets, sample images
  valid_until     date,

  status          text not null default 'submitted'
                  check (status in ('submitted','viewed','shortlisted','rejected','awarded')),
  match_score     numeric(4,3),                   -- AI score 0..1

  created_at      timestamptz default now()
);

create index idx_quote_rfq on quotes(rfq_id, created_at desc);
create index idx_quote_supplier on quotes(supplier_id);

-- ─────────────────────────────────────────────────────────────
-- Supplier reviews
create table supplier_reviews (
  id              uuid primary key default gen_random_uuid(),
  supplier_id     uuid not null references suppliers(id) on delete cascade,
  org_id          uuid not null references organizations(id) on delete cascade,
  rfq_id          uuid references rfqs(id),

  rating          int not null check (rating between 1 and 5),
  quality_rating  int check (quality_rating between 1 and 5),
  communication_rating int check (communication_rating between 1 and 5),
  delivery_rating int check (delivery_rating between 1 and 5),

  title           text,
  body            text,
  would_reorder   boolean,
  verified_purchase boolean default false,

  created_at      timestamptz default now()
);

create unique index uq_review_per_buyer_supplier
  on supplier_reviews(supplier_id, org_id);
create index idx_review_supplier on supplier_reviews(supplier_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- AI match logs (audit + improve model)
create table supplier_match_logs (
  id              bigserial primary key,
  rfq_id          uuid references rfqs(id) on delete cascade,
  org_id          uuid not null references organizations(id) on delete cascade,
  user_id         uuid references auth.users(id),

  matched_suppliers jsonb not null,               -- [{supplier_id, score, reason}, ...]
  model_used      text,
  prompt_tokens   int,
  completion_tokens int,
  latency_ms      int,

  created_at      timestamptz default now()
);

create index idx_match_rfq on supplier_match_logs(rfq_id);

-- ─────────────────────────────────────────────────────────────
-- RLS
alter table rfqs enable row level security;
alter table quotes enable row level security;
alter table supplier_reviews enable row level security;
alter table supplier_match_logs enable row level security;

-- Suppliers + supplier_products are PUBLIC read (it's a marketplace)
-- but write is restricted to admin / supplier portal (out of scope here).
alter table suppliers enable row level security;
alter table supplier_products enable row level security;
create policy "anyone can read suppliers"  on suppliers for select using (true);
create policy "anyone can read products"   on supplier_products for select using (true);

-- RFQs: org members can read their own, suppliers can read open RFQs in their categories.
create policy "members read own org rfqs"
  on rfqs for select
  using (org_id in (select public.user_org_ids()));

create policy "members create rfqs for own org"
  on rfqs for insert
  with check (org_id in (select public.user_org_ids()));

-- Quotes: visible to the RFQ's org and to the supplier who submitted.
create policy "buyer org sees quotes on own rfqs"
  on quotes for select
  using (
    exists (
      select 1 from rfqs r
      where r.id = quotes.rfq_id
        and r.org_id in (select public.user_org_ids())
    )
  );

-- Match logs: org-scoped audit trail.
create policy "members see own match logs"
  on supplier_match_logs for select
  using (org_id in (select public.user_org_ids()));

-- ─────────────────────────────────────────────────────────────
-- Vector match RPC for supplier discovery
create or replace function match_suppliers(
  query_embedding vector(1536),
  match_count int default 10,
  country_filter text default null,
  require_form_e boolean default false
)
returns table (
  id uuid,
  trade_name text,
  country text,
  city text,
  rating numeric,
  review_count int,
  is_verified boolean,
  supports_form_e boolean,
  main_categories text[],
  similarity float
)
language sql
stable
as $$
  select
    s.id,
    s.trade_name,
    s.country,
    s.city,
    s.rating,
    s.review_count,
    s.is_verified,
    s.supports_form_e,
    s.main_categories,
    1 - (s.embedding <=> query_embedding) as similarity
  from suppliers s
  where (country_filter is null or s.country = country_filter)
    and (not require_form_e or s.supports_form_e = true)
  order by s.embedding <=> query_embedding
  limit match_count;
$$;

-- Vector match for supplier *products* — used when buyer's RFQ is product-specific.
create or replace function match_supplier_products(
  query_embedding vector(1536),
  match_count int default 15,
  country_filter text default null
)
returns table (
  product_id uuid,
  supplier_id uuid,
  name_en text,
  hs_code text,
  moq int,
  price_min_usd numeric,
  price_max_usd numeric,
  lead_time_days_min int,
  hs_form_eligible text[],
  similarity float
)
language sql
stable
as $$
  select
    p.id as product_id,
    p.supplier_id,
    p.name_en,
    p.hs_code,
    p.moq,
    p.price_min_usd,
    p.price_max_usd,
    p.lead_time_days_min,
    p.hs_form_eligible,
    1 - (p.embedding <=> query_embedding) as similarity
  from supplier_products p
  join suppliers s on s.id = p.supplier_id
  where p.is_active = true
    and (country_filter is null or s.country = country_filter)
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- ════════════════════════════════════════════════════════════════
-- VERIFICATION — should return 17 rows
-- ════════════════════════════════════════════════════════════════

select
  tablename,
  case
    when tablename in (
      'organizations','user_profiles','organization_members',
      'subscription_plans','subscriptions','usage_counters',
      'documents','document_items','hs_code_reference','hs_code_logs',
      'audit_logs','suppliers','supplier_products','rfqs','quotes',
      'supplier_reviews','supplier_match_logs'
    ) then '✅ OK'
    else '⚠️ unknown'
  end as status
from pg_tables
where schemaname = 'public'
order by tablename;
