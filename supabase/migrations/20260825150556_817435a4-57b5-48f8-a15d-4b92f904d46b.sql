create or replace function public.get_pending_lock_code_schedule(_property_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select min(s.apply_at)
  from public.property_lock_code_schedules s
  join public.properties p on p.id = s.property_id and p.status = 'active'
  where s.property_id = _property_id
    and s.status = 'scheduled'
    and s.apply_at > now()
$$;

grant execute on function public.get_pending_lock_code_schedule(uuid) to anon, authenticated;