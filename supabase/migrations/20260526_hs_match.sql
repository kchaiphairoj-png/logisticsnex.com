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
