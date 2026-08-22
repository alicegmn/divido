create or replace function public.create_group(group_name text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_group_id uuid;
begin
  insert into public.groups (
    name,
    created_by
  )
  values (
    group_name,
    auth.uid()
  )
  returning id into new_group_id;

  insert into public.group_members (
    group_id,
    user_id
  )
  values (
    new_group_id,
    auth.uid()
  );

  return new_group_id;
end;
$$;

revoke execute on function public.create_group(text) from public;
revoke execute on function public.create_group(text) from anon;
grant execute on function public.create_group(text) to authenticated;