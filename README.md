# Mujeres Edifican · Área de Miembros

Mini app (área de membros) para entregar seus PDFs às compradoras do produto
**Mujeres Edifican** (https://mujeresedifican.shop).

## Como funciona o login (exatamente como você pediu)

1. A pessoa digita **o email com que fez a compra**.
2. **Primeiro acesso:** se o email está na lista de compradoras e ainda não tem
   senha, ela **cria uma senha**. Pronto, entra na área de membros.
3. **Próximos acessos:** ela sempre entra com **o mesmo email + a senha** que criou.

Quem digita um email que **não** está na lista de compras recebe uma mensagem
avisando que precisa usar o email da compra. Ninguém sem compra consegue entrar.

## Stack
- **Next.js 15** (App Router) — front + rotas de API.
- **Supabase** — banco Postgres (lista de compradoras + materiais) e Storage
  privado para os PDFs.
- Senhas com **bcrypt**; sessão em cookie httpOnly assinado (**JWT / jose**).
- PDFs entregues por **URL assinada temporária** (10 min) — só para quem está logado.

## Configuração (uma vez)

No arquivo `.env.local` já estão a URL e a chave pública do Supabase. Falta **1 chave**:

1. Abra o painel do Supabase → projeto **mujeres-edifican** → *Project Settings*
   → *API* → copie o segredo **`service_role`**.
2. Cole em `.env.local` na linha `SUPABASE_SERVICE_ROLE_KEY=`.

## Rodar local
```bash
npm install
npm run dev
# abre http://localhost:3000
```

## Carregar as compradoras (lista de emails liberados)
Crie um CSV com cabeçalho `email` (e opcionalmente `nombre`):
```csv
email,nombre
maria@ejemplo.com,María
ana@ejemplo.com,Ana
```
Depois:
```bash
npm run importar:compradoras -- compradoras.csv
```
Rode de novo sempre que houver novas vendas — não apaga senhas já criadas.

## Subir os PDFs (o entregável)
Coloque todos os `.pdf` numa pasta (ex.: `./pdfs`) e rode:
```bash
npm run subir:pdfs -- ./pdfs
```
Cada PDF vira um card na área de membros. O título sai do nome do arquivo
(`Modulo_1.pdf` → "Modulo 1"). Para ajustar título, descrição, emoji ou ordem,
edite a tabela `materiales` no Supabase.

**Me envie os PDFs** que eu já subo e organizo os cards para você.

## Deploy (Vercel)
Suba na Vercel e configure as 4 variáveis de ambiente do `.env.local`
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`).
