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
  embedding       vector(768),

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
  embedding       vector(768),
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

  embedding       vector(768),
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
  query_embedding vector(768),
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
  query_embedding vector(768),
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
