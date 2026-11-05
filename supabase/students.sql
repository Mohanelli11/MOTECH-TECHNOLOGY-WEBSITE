-- MOTECH for Engineering Students (marketplace). Run once in Supabase -> SQL Editor,
-- AFTER schema.sql and payments.sql. Safe to re-run.

create table if not exists public.student_projects (
  id          text primary key,
  slug        text not null unique,
  title       text not null,
  summary     text not null default '',
  description text not null default '',
  category    text not null default 'General',
  level       text not null default 'Final-year',
  price       numeric(12,2) not null check (price >= 0),
  currency    text not null default 'KES',
  status      text not null default 'draft' check (status in ('available','draft','disabled')),
  image_url   text not null default '',
  tags        text[] not null default '{}',
  includes    text[] not null default '{}',
  file_path   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.student_projects enable row level security;

-- Visitors (not signed in) see only published projects. Signed-in users see published ones;
-- the admin sees everything, including drafts. (Split in two because visitors may not call is_admin().)
drop policy if exists projects_read on public.student_projects;
drop policy if exists projects_read_public on public.student_projects;
create policy projects_read_public on public.student_projects for select to anon
  using (status = 'available');
drop policy if exists projects_read_signed_in on public.student_projects;
create policy projects_read_signed_in on public.student_projects for select to authenticated
  using (status = 'available' or public.is_admin());
drop policy if exists projects_admin_write on public.student_projects;
create policy projects_admin_write on public.student_projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.student_projects from anon, authenticated;
grant select on public.student_projects to anon, authenticated;
grant insert, update, delete on public.student_projects to authenticated;

-- Storage: project packages are PRIVATE (delivered only through the project-download function
-- after a confirmed payment); cover images are public.
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true)
  on conflict (id) do nothing;

drop policy if exists project_storage_admin on storage.objects;
create policy project_storage_admin on storage.objects for all to authenticated
  using (bucket_id in ('project-files', 'project-images') and public.is_admin())
  with check (bucket_id in ('project-files', 'project-images') and public.is_admin());
drop policy if exists project_images_public_read on storage.objects;
create policy project_images_public_read on storage.objects for select
  using (bucket_id = 'project-images');
