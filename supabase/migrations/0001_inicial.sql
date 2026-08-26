-- Compradoras liberadas (lista de emails que compraram) + credencial de acesso
create table if not exists public.compradoras (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nombre text,
  password_hash text,          -- null = ainda nao criou senha (primeiro acesso)
  activada_en timestamptz,     -- quando criou a senha
  creada_en timestamptz not null default now()
);
create index if not exists idx_compradoras_email on public.compradoras (email);

-- Materiais (PDFs) disponiveis na area de membros
create table if not exists public.materiales (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  emoji text,
  archivo text not null,       -- caminho no Storage bucket 'materiales'
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- RLS ligado; acesso somente via service_role (rotas de API no servidor)
alter table public.compradoras enable row level security;
alter table public.materiales  enable row level security;
