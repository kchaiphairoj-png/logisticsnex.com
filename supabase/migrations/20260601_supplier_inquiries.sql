-- ════════════════════════════════════════════════════════════════
-- Supplier Inquiries — buyer↔supplier relay channel
-- ════════════════════════════════════════════════════════════════
-- A buyer org submits an inquiry to a supplier through the marketplace.
-- LogisticsNex's ops team forwards it (out-of-band) to the supplier and
-- relays the reply back, updating `status` + `supplier_response` here.
--
-- This avoids the complexity of giving suppliers their own login while
-- still capturing the whole conversation for audit, search, and metrics.
-- ════════════════════════════════════════════════════════════════

create table if not exists supplier_inquiries (
  id              uuid primary key default gen_random_uuid(),
  buyer_org_id    uuid not null references organizations(id) on delete cascade,
  buyer_user_id   uuid not null references auth.users(id) on delete set null,
  supplier_id     uuid not null references suppliers(id) on delete cascade,

  -- Inquiry payload
  subject         text not null,
  message         text not null,
  quantity        int,
  quantity_unit   text default 'pcs',
  target_price_usd numeric(10,2),
  needed_by_date  date,

  -- Relay state
  status          text not null default 'pending'
                  check (status in ('pending', 'in_review', 'forwarded', 'responded', 'closed')),
  admin_note      text,
  supplier_response text,
  responded_at    timestamptz,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_inq_buyer_org on supplier_inquiries(buyer_org_id, created_at desc);
create index if not exists idx_inq_supplier  on supplier_inquiries(supplier_id);
create index if not exists idx_inq_status    on supplier_inquiries(status) where status != 'closed';

-- ────────────────────────────────────────────────────────────────
-- Row-Level Security
-- Buyers of an org see + create inquiries scoped to that org.
-- (Suppliers don't have logins yet — admin handles the relay.)
-- ────────────────────────────────────────────────────────────────
alter table supplier_inquiries enable row level security;

drop policy if exists "buyer org reads own inquiries" on supplier_inquiries;
create policy "buyer org reads own inquiries"
  on supplier_inquiries for select
  using (buyer_org_id in (select public.user_org_ids()));

drop policy if exists "buyer org creates inquiries" on supplier_inquiries;
create policy "buyer org creates inquiries"
  on supplier_inquiries for insert
  with check (
    buyer_org_id in (select public.user_org_ids())
    and buyer_user_id = auth.uid()
  );

-- Allow buyer to close (cancel) their own inquiry. They can NEVER update
-- supplier_response / admin_note — that's admin-only via the service role.
drop policy if exists "buyer closes own inquiry" on supplier_inquiries;
create policy "buyer closes own inquiry"
  on supplier_inquiries for update
  using (buyer_org_id in (select public.user_org_ids()))
  with check (buyer_org_id in (select public.user_org_ids()));

-- ────────────────────────────────────────────────────────────────
-- Auto-update updated_at on every row change
-- ────────────────────────────────────────────────────────────────
create or replace function bump_supplier_inquiries_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bump_inq_updated_at on supplier_inquiries;
create trigger trg_bump_inq_updated_at
  before update on supplier_inquiries
  for each row execute function bump_supplier_inquiries_updated_at();

-- ✓ Done.
