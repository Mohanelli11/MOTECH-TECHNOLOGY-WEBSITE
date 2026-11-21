-- Rate limiting for the website AI assistant (protects your Anthropic bill). Run once in the SQL Editor. Safe to re-run.
create table if not exists public.assistant_usage (
  bucket       text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);
alter table public.assistant_usage enable row level security;
revoke all on public.assistant_usage from anon, authenticated;

-- Counts one request in the current hour; returns false once the limit is exceeded.
create or replace function public.assistant_rate_check(p_bucket text, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.assistant_usage where window_start < now() - interval '2 hours';
  insert into public.assistant_usage (bucket, window_start, hits)
    values (p_bucket, date_trunc('hour', now()), 1)
    on conflict (bucket, window_start) do update set hits = public.assistant_usage.hits + 1
    returning hits into n;
  return n <= p_limit;
end $$;
revoke all on function public.assistant_rate_check(text, integer) from public, anon, authenticated;
grant execute on function public.assistant_rate_check(text, integer) to service_role;
