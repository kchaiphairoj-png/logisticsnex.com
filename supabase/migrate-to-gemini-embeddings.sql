-- ════════════════════════════════════════════════════════════════
-- Migration: OpenAI 1536d embeddings → Gemini 768d embeddings
-- ════════════════════════════════════════════════════════════════
-- Run this AFTER swapping the agents to Gemini.
-- Safe because no embedding data has been seeded yet (hs_code_reference
-- is empty, no suppliers exist).
--
-- If you DO have data, you must re-embed after running this.
-- ════════════════════════════════════════════════════════════════

-- 1. Drop dependent HNSW indexes first
drop index if exists idx_hs_embedding;
drop index if exists idx_supplier_embedding;
drop index if exists idx_product_embedding;
drop index if exists idx_rfq_embedding;

-- 2. Resize columns from vector(1536) → vector(768)
alter table hs_code_reference   alter column embedding type vector(768) using null;
alter table suppliers           alter column embedding type vector(768) using null;
alter table supplier_products   alter column embedding type vector(768) using null;
alter table rfqs                alter column embedding type vector(768) using null;

-- 3. Recreate HNSW indexes
create index idx_hs_embedding       on hs_code_reference  using hnsw (embedding vector_cosine_ops);
create index idx_supplier_embedding on suppliers          using hnsw (embedding vector_cosine_ops);
create index idx_product_embedding  on supplier_products  using hnsw (embedding vector_cosine_ops);
create index idx_rfq_embedding      on rfqs               using hnsw (embedding vector_cosine_ops);

-- 4. Update the RPC function signatures to accept 768-dim vectors
create or replace function match_hs_codes(
  query_embedding vector(768),
  match_count int default 10,
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
  where chapter_filter is null or left(h.code, 2) = chapter_filter
  order by h.embedding <=> query_embedding
  limit match_count;
$$;

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
    s.id, s.trade_name, s.country, s.city, s.rating, s.review_count,
    s.is_verified, s.supports_form_e, s.main_categories,
    1 - (s.embedding <=> query_embedding) as similarity
  from suppliers s
  where (country_filter is null or s.country = country_filter)
    and (not require_form_e or s.supports_form_e = true)
  order by s.embedding <=> query_embedding
  limit match_count;
$$;

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
    p.id, p.supplier_id, p.name_en, p.hs_code, p.moq,
    p.price_min_usd, p.price_max_usd, p.lead_time_days_min,
    p.hs_form_eligible,
    1 - (p.embedding <=> query_embedding) as similarity
  from supplier_products p
  join suppliers s on s.id = p.supplier_id
  where p.is_active = true
    and (country_filter is null or s.country = country_filter)
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- ✓ Done. All vector columns are now 768-dim, ready for Gemini text-embedding-004.
