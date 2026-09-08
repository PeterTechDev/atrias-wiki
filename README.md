# Átrias Wiki

A Wikipedia-style wiki for the Átrias RPG universe, built as a surprise gift for the DM who created this world.

## Contas da mesa

Em `/login`, membros podem criar uma conta com nome, sobrenome, nome público, email,
senha e avatar padrão. O acesso é imediato, sem confirmação de email, por decisão do
responsável pela mesa. Após entrar, é possível editar o perfil e enviar uma foto de até 2 MB.
O menu superior mostra o perfil e permite sair. Recuperação de senha por email depende
da futura configuração de SMTP.

Supabase Auth gerencia as contas; `public.profiles` expõe apenas a identidade pública.
As migrações e políticas de isolamento dos uploads estão em `supabase/`.
Execute `npx supabase db query --linked -f supabase/tests/profiles.sql` para verificar as políticas.
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` podem substituir
os valores públicos do projeto no build. Nunca exponha credenciais administrativas.

O conteúdo existente continua no PostgreSQL/Drizzle. O login de membros não concede
acesso ao painel administrativo, que mantém sua autenticação atual. Atribuição automática
do último editor é registrada pelas rotas `/api/wiki/entities` e aparece nas páginas públicas.
O teste da confirmação de senha do cadastro é `npm run test:signup-password`.

### Edição por membros

Antes do rollout, aplique `supabase/migrations/20260908083000_wiki_entity_editing.sql` no
banco que contém `entities`. A migration converte os timestamps sem fuso legados assumindo
UTC, adiciona `updated_by`, `updated_by_source` e `revision`, e não cria FK para Supabase.

As páginas `/wiki/{collection}/new` e `/wiki/{collection}/{slug}/edit` exigem uma sessão
Supabase não anônima. A API valida o bearer token no servidor, usa revisão otimista e preserva
chaves desconhecidas de `data`. `WIKI_EDITING_ENABLED=false` bloqueia POST/PATCH com 503,
mantendo a leitura pública; o valor padrão permite testar a funcionalidade antes do rollout.

O check local da preservação de dados é `npm run test:wiki`. Para uma publicação com runtime
Next.js, configure `DATABASE_URL`, as variáveis públicas do Supabase e execute `npm run lint`
e `npm run build` no preview antes de habilitar a escrita.

O arquivamento de páginas usa `supabase/migrations/20260908090000_wiki_entity_archiving.sql`.
Membros podem arquivar páginas pelo detalhe e excluir uma ou várias páginas em `/wiki/archived`.
O check local de validação dos lotes é `npm run test:wiki-archiving`. A busca consulta o banco
dinamicamente e páginas arquivadas permanecem invisíveis para visitantes.

### Favoritos

Antes do rollout, aplique `supabase/migrations/20260908150000_entity_favorites.sql` no banco
que contém `entities`. Ela cria favoritos isolados por usuário e remove referências ao excluir a
página. RLS bloqueia acesso direto pela Data API; as APIs usam a conexão de servidor proprietária da tabela (ou com BYPASSRLS). Reaplique a migration se a versão sem RLS já foi instalada.

Execute `npm run test:wiki-favorites` com `DATABASE_URL` em `.env.local`: o teste usa tabelas temporárias e rollback para verificar isolamento, idempotência, integridade, arquivamento e configuração de RLS, sem alterar dados persistidos.

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Database**: PostgreSQL + pgvector
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- npm/yarn/pnpm

### 1. Clone and Install

```bash
git clone https://github.com/PeterTechDev/atrias-wiki.git
cd atrias-wiki
npm install
```

### 2. Start the Database

```bash
docker compose up -d
```

This starts PostgreSQL with the pgvector extension on port 5432.

### 3. Set Up Environment

Create a `.env.local` file:

```env
DATABASE_URL=postgres://atrias:atrias_dev@localhost:5432/atrias_wiki
```

### 4. Initialize Database Schema

```bash
npm run db:push
```

### 5. Seed the Database

```bash
npm run db:seed
```

This imports all entities from `import-output/entities.json`.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the wiki.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (generates search index) |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database from entities.json |
| `npm run test:wiki-favorites` | Verify favorites isolation, idempotence and cascade |
| `npm run generate:search` | Generate search index JSON |

## Adding Entity Images

1. Add image to `public/images/<type>/` (e.g., `public/images/characters/akdai.jpg`)

2. Update the entity in Drizzle Studio:
   ```bash
   npm run db:studio
   ```
   Set the `image` field to `/images/characters/akdai.jpg`

3. Regenerate search index:
   ```bash
   npm run generate:search
   ```

## Project Structure

```
atrias-wiki/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── characters/      # Character list & detail pages
│   │   ├── places/          # Places list & detail pages
│   │   ├── factions/        # Factions list & detail pages
│   │   ├── items/           # Items list & detail pages
│   │   ├── lore/            # Lore list & detail pages
│   │   ├── monsters/        # Monsters/Bestiary pages
│   │   ├── sessions/        # Session logs
│   │   └── search/          # Client-side search
│   ├── db/
│   │   ├── index.ts         # Database client
│   │   ├── schema.ts        # Drizzle table definitions
│   │   └── queries/         # Query functions
│   └── types/
│       └── entities.ts      # TypeScript type definitions
├── scripts/
│   ├── seed-database.ts     # Database seeding script
│   └── generate-search-index.ts  # Legacy search export utility
├── public/
│   ├── images/              # Entity images
├── docker/
│   └── init/                # PostgreSQL init scripts
├── docker-compose.yml       # PostgreSQL + pgvector
├── drizzle.config.ts        # Drizzle ORM configuration
└── docs/
    └── AI_FIRST_ARCHITECTURE.md
```

## Database Schema

The wiki uses 4 main tables:

- **entities**: All wiki content (characters, places, factions, items, lore, monsters, sessions)
- **entity_relations**: Connections between entities
- **knowledge_chunks**: Reference content for future RAG
- **ingestion_jobs**: Pipeline tracking for AI processing

See `src/db/schema.ts` for full schema details.

## Features

- **176+ entities** extracted from DM's documents
- **Client-side search** with instant filtering (static export compatible)
- **Entity type icons** from game-icons with custom image support
- **Dark fantasy theme** inspired by Baldur's Gate / Elden Ring
- **Mobile responsive** design

## Documentation

- [PLANNING.md](./PLANNING.md) - Project planning and roadmap
- [AI_FIRST_ARCHITECTURE.md](./docs/AI_FIRST_ARCHITECTURE.md) - AI-first architecture design

## License

Private project - All rights reserved.
