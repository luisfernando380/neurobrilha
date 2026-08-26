-- Arquitetura sem segredos no cliente:
-- funcoes SECURITY DEFINER chamadas com a chave publishable (anon) + token de sessao opaco.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sesiones (
  token uuid primary key default gen_random_uuid(),
  email text not null references public.compradoras(email) on delete cascade,
  creada_en timestamptz not null default now(),
  expira timestamptz not null
);
alter table public.sesiones enable row level security;

-- Ver arquivo do repositorio para as funcoes:
--   me_verificar, me_registrar, me_login, me_materiales, me_logout
-- (todas SECURITY DEFINER, search_path = public, extensions; grants para anon)
