create type public.app_role as enum ('admin', 'utility_data_viewer', 'customer');

-- updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- user_roles (created before has_role, which references it)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

-- role check helper (security definer to avoid RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins can read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

-- utility_connections
create table public.utility_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_ref text not null unique,
  utility text not null default 'pge',
  service_agreement_ref text,
  authorization_status text not null default 'not_connected',
  connection_status text not null default 'inactive',
  authorized_at timestamptz,
  last_sync_at timestamptz,
  last_sync_status text,
  subscription_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.utility_connections to authenticated;
grant all on public.utility_connections to service_role;
alter table public.utility_connections enable row level security;
create policy "Customers read own connections" on public.utility_connections for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all connections" on public.utility_connections for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger update_utility_connections_updated_at before update on public.utility_connections for each row execute function public.update_updated_at_column();

-- utility_authorizations (metadata only, no tokens)
create table public.utility_authorizations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.utility_connections(id) on delete cascade,
  authorization_ref text,
  scope text,
  granted_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.utility_authorizations to authenticated;
grant all on public.utility_authorizations to service_role;
alter table public.utility_authorizations enable row level security;
create policy "Customers read own authorizations" on public.utility_authorizations for select to authenticated using (
  exists (select 1 from public.utility_connections c where c.id = connection_id and c.user_id = auth.uid())
);
create policy "Admins read all authorizations" on public.utility_authorizations for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger update_utility_authorizations_updated_at before update on public.utility_authorizations for each row execute function public.update_updated_at_column();

-- utility_oauth_tokens: service_role only, zero client policies
create table public.utility_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.utility_connections(id) on delete cascade unique,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant all on public.utility_oauth_tokens to service_role;
alter table public.utility_oauth_tokens enable row level security;
create trigger update_utility_oauth_tokens_updated_at before update on public.utility_oauth_tokens for each row execute function public.update_updated_at_column();

-- utility_oauth_states: service_role only
create table public.utility_oauth_states (
  id uuid primary key default gen_random_uuid(),
  state text not null unique,
  code_verifier text,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
grant all on public.utility_oauth_states to service_role;
alter table public.utility_oauth_states enable row level security;

-- utility_sync_events
create table public.utility_sync_events (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.utility_connections(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  status text not null,
  record_count integer,
  error_category text,
  created_at timestamptz not null default now()
);
grant select on public.utility_sync_events to authenticated;
grant all on public.utility_sync_events to service_role;
alter table public.utility_sync_events enable row level security;
create policy "Admins read all sync events" on public.utility_sync_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- utility_data_metadata
create table public.utility_data_metadata (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.utility_connections(id) on delete cascade,
  period_start timestamptz,
  period_end timestamptz,
  record_count integer not null default 0,
  processing_status text not null default 'pending',
  verification_status text not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.utility_data_metadata to authenticated;
grant all on public.utility_data_metadata to service_role;
alter table public.utility_data_metadata enable row level security;
create policy "Customers read own data metadata" on public.utility_data_metadata for select to authenticated using (
  exists (select 1 from public.utility_connections c where c.id = connection_id and c.user_id = auth.uid())
);
create policy "Admins read all data metadata" on public.utility_data_metadata for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger update_utility_data_metadata_updated_at before update on public.utility_data_metadata for each row execute function public.update_updated_at_column();

-- utility_usage_intervals: service_role only, zero client policies
create table public.utility_usage_intervals (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.utility_connections(id) on delete cascade,
  usage_point_ref text,
  interval_start timestamptz not null,
  interval_duration_seconds integer not null,
  value_wh numeric not null,
  quality text,
  created_at timestamptz not null default now()
);
grant all on public.utility_usage_intervals to service_role;
alter table public.utility_usage_intervals enable row level security;
create index utility_usage_intervals_connection_idx on public.utility_usage_intervals (connection_id, interval_start);

-- utility_access_audit
create table public.utility_access_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  connection_id uuid references public.utility_connections(id) on delete set null,
  action text not null,
  result text not null,
  created_at timestamptz not null default now()
);
grant select on public.utility_access_audit to authenticated;
grant all on public.utility_access_audit to service_role;
alter table public.utility_access_audit enable row level security;
create policy "Admins read audit log" on public.utility_access_audit for select to authenticated using (public.has_role(auth.uid(), 'admin'));