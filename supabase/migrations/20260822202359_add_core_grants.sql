grant usage on schema public to authenticated;

grant select, update
on table public.profiles
to authenticated;

grant select, insert
on table public.groups
to authenticated;

grant select, insert
on table public.group_members
to authenticated;


drop policy if exists "Members can view groups"
on public.groups;

create policy "Members or creators can view groups"
on public.groups
for select
to authenticated
using (
  created_by = (select auth.uid())
  or (select public.is_group_member(id))
);