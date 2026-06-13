alter table if exists public.tests
  add column if not exists category text;

alter table if exists public.inventory_items
  add column if not exists unit_cost numeric(12,2) not null default 0;

alter table if exists public.inventory_transactions
  add column if not exists unit_cost numeric(12,2) not null default 0;

alter table if exists public.inventory_transactions
  add column if not exists total_cost numeric(12,2) not null default 0;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete restrict default public.default_facility_id(),
  title text not null,
  category text not null default 'General',
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  source text not null default 'manual' check (source in ('manual', 'inventory_purchase', 'inventory_usage', 'other')),
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  inventory_transaction_id uuid references public.inventory_transactions(id) on delete set null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_facility_category_idx
  on public.inventory_items (facility_id, category);

create index if not exists inventory_transactions_facility_type_created_idx
  on public.inventory_transactions (facility_id, transaction_type, created_at desc);

create index if not exists expenses_facility_date_idx
  on public.expenses (facility_id, expense_date desc);

create index if not exists expenses_facility_category_idx
  on public.expenses (facility_id, category, expense_date desc);

alter table public.expenses enable row level security;

drop policy if exists "Facility users can read expenses" on public.expenses;
create policy "Facility users can read expenses"
on public.expenses
for select
using (public.facility_access_allowed(facility_id));

drop policy if exists "Billing managers can insert expenses" on public.expenses;
create policy "Billing managers can insert expenses"
on public.expenses
for insert
with check (
  public.facility_access_allowed(facility_id)
  and public.current_user_can_manage_billing()
);

drop policy if exists "Billing managers can update expenses" on public.expenses;
create policy "Billing managers can update expenses"
on public.expenses
for update
using (
  public.facility_access_allowed(facility_id)
  and public.current_user_can_manage_billing()
)
with check (
  public.facility_access_allowed(facility_id)
  and public.current_user_can_manage_billing()
);

drop policy if exists "Billing managers can delete expenses" on public.expenses;
create policy "Billing managers can delete expenses"
on public.expenses
for delete
using (
  public.facility_access_allowed(facility_id)
  and public.current_user_can_manage_billing()
);
