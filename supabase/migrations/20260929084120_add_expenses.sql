create table public.expenses (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null
    references public.groups(id)
    on delete cascade,

  description text not null,

  amount_minor bigint not null
    check (amount_minor > 0),

  currency text not null default 'SEK',

  paid_by uuid not null
    references public.profiles(id),

  created_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now()
);


create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),

  expense_id uuid not null
    references public.expenses(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id),

  amount_minor bigint not null
    check (amount_minor >= 0),

  created_at timestamptz not null default now(),

  unique (expense_id, user_id)
);

alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

grant select, insert
on table public.expenses
to authenticated;

grant select, insert
on table public.expense_splits
to authenticated;

create policy "Group members can view expenses"
on public.expenses
for select
to authenticated
using (
  public.is_group_member(group_id)
);


create policy "Group members can create expenses"
on public.expenses
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.is_group_member(group_id)
);


create policy "Group members can view expense splits"
on public.expense_splits
for select
to authenticated
using (
  exists (
    select 1
    from public.expenses
    where expenses.id = expense_splits.expense_id
      and public.is_group_member(expenses.group_id)
  )
);


create policy "Group members can create expense splits"
on public.expense_splits
for insert
to authenticated
with check (
  exists (
    select 1
    from public.expenses
    where expenses.id = expense_splits.expense_id
      and expenses.created_by = (select auth.uid())
      and public.is_group_member(expenses.group_id)
  )
);