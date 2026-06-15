-- =====================================================================
-- RP Servicos Automotivos - Estrutura de seguranca (LGPD)
-- Rode este script no SQL Editor do seu projeto Supabase
-- (Dashboard > SQL Editor > New query > cole e clique em "Run").
-- =====================================================================

-- 1) Tabela de perfis: armazena dados sensiveis SEPARADOS do auth.users.
--    Os dados (CPF/CNPJ, telefone) saem do raw_user_meta_data e passam
--    a viver aqui, protegidos por Row Level Security (RLS).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome_completo text,
  cpf_cnpj text,
  telefone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario so enxerga e edita o proprio perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2) Garante RLS tambem na tabela de carros (cada um ve apenas os seus).
alter table if exists public.carros enable row level security;

drop policy if exists "carros_select_own" on public.carros;
create policy "carros_select_own"
  on public.carros for select
  using (auth.uid() = user_id);

drop policy if exists "carros_insert_own" on public.carros;
create policy "carros_insert_own"
  on public.carros for insert
  with check (auth.uid() = user_id);

drop policy if exists "carros_delete_own" on public.carros;
create policy "carros_delete_own"
  on public.carros for delete
  using (auth.uid() = user_id);
