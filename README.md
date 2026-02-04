# Átrias Wiki

A Wikipedia-style wiki for the Átrias RPG universe, built as a surprise gift for the DM who created this world.

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Database**: PostgreSQL + pgvector
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm/yarn/pnpm

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/atrias-wiki.git
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
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database from entities.json |

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
│   │   ├── search/          # Search functionality
│   │   └── api/             # API routes
│   ├── db/
│   │   ├── index.ts         # Database client
│   │   ├── schema.ts        # Drizzle table definitions
│   │   └── queries/         # Query functions
│   └── types/
│       └── entities.ts      # TypeScript type definitions
├── scripts/
│   └── seed-database.ts     # Database seeding script
├── import-output/
│   └── entities.json        # Extracted entity data
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

## Documentation

- [PLANNING.md](./PLANNING.md) - Project planning and roadmap
- [AI_FIRST_ARCHITECTURE.md](./docs/AI_FIRST_ARCHITECTURE.md) - AI-first architecture design

## License

Private project - All rights reserved.
