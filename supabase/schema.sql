-- MOTECH customer accounts: shared database (Supabase / PostgreSQL)
-- Run this ONCE in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is safe to run again (everything uses "if not exists" / "or replace").
--
-- Passwords are NOT stored here. Supabase Auth keeps them (bcrypt-hashed) in auth.users,
-- so a customer can sign in from any device with the password they chose.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  name        text not null default '',
  company     text not null default '',
  phone       text not null default '',
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  disabled    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Is the signed-in user an enabled administrator? (security definer so the policy can't recurse)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not disabled
  );
$$;

-- Every new sign-up gets a profile automatically. New accounts are ALWAYS customers;
-- admins are promoted explicitly (see the last step of this file).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, company, phone)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'company', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Who can read what:
--   * everyone signed in can read their OWN profile
--   * administrators can read ALL profiles (this is how the admin sees every new account)
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "admin reads all profiles" on public.profiles;
create policy "admin reads all profiles" on public.profiles
  for select to authenticated using (public.is_admin());

-- Customers may edit only their own name, company and phone. They cannot touch
-- role, disabled, email or id: column-level permission blocks that at the database.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, company, phone) on public.profiles to authenticated;

-- Admin-only action: enable / disable a customer account.
create or replace function public.admin_set_user_disabled(target uuid, flag boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator privileges required.' using errcode = '42501';
  end if;
  update public.profiles
     set disabled = flag
   where id = target and role <> 'admin';
end;
$$;

revoke all on function public.admin_set_user_disabled(uuid, boolean) from public, anon;
grant execute on function public.admin_set_user_disabled(uuid, boolean) to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- LAST STEP (after you have created the administrator login - see SETUP-SHARED-ACCOUNTS.md):
-- promote it to admin. Uncomment and run just this line.
--
-- update public.profiles set role = 'admin' where email = 'motechembeddedengineering@gmail.com';
-- ---------------------------------------------------------------------------------------------
