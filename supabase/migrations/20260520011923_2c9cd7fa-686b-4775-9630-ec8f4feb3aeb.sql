insert into storage.buckets (id, name, public)
values ('email-assets', 'email-assets', true)
on conflict (id) do update set public = true;

do $$ begin
  create policy "Public read email-assets" on storage.objects for select using (bucket_id = 'email-assets');
exception when duplicate_object then null; end $$;