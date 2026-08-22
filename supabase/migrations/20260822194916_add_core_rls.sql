alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_group_member(uuid) from public;
revoke execute on function public.is_group_member(uuid) from anon;
grant execute on function public.is_group_member(uuid) to authenticated;


create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);


create policy "Users can view profiles in shared groups"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.group_members gm_self
    join public.group_members gm_other
      on gm_self.group_id = gm_other.group_id
    where gm_self.user_id = (select auth.uid())
      and gm_other.user_id = profiles.id
  )
);


create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);


create policy "Members can view groups"
on public.groups
for select
to authenticated
using (
  (select public.is_group_member(id))
);


create policy "Authenticated users can create groups"
on public.groups
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);


create policy "Members can view group members"
on public.group_members
for select
to authenticated
using (
  (select public.is_group_member(group_id))
);


create policy "Users can add themselves to groups they created"
on public.group_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.groups
    where groups.id = group_members.group_id
      and groups.created_by = (select auth.uid())
  )
);


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();