# Átrias Wiki — Agent Instructions

> A D&D world wiki — a gift for Peter's D&D group. Every detail matters. Treat the lore with respect.

Átrias is a homebrew D&D world with 176+ entities, 7 continents, and a rich narrative. The wiki is a living document of the campaign, narrated by Thaveus (an in-world chronicler).

## Tech Stack

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 (CSS-first config)
- **Database:** PostgreSQL via Drizzle ORM
- **Maps:** Leaflet + react-leaflet (interactive world map)
- **Icons:** @iconify/react (NOT Lucide — this project uses Iconify)
- **Search:** Pre-generated search index (`npm run generate:search`)
- **AI (dev only):** OpenAI for content generation scripts (devDependency)

## Pages

| Route | What it is |
|-------|-----------|
| `/` | Landing page |
| `/browse` | Browse all entities |
| `/characters/[slug]` | Character detail page |
| `/factions/[slug]` | Faction detail page |
| `/places/[slug]` | Location detail page |
| `/items/[slug]` | Item detail page |
| `/lore/[slug]` | Lore article page |
| `/monsters/[slug]` | Monster/creature page |
| `/sessions/[campaign]/[chapter]` | Session recap / chapter |
| `/map` | Interactive world map (Leaflet) |
| `/search` | Full-text search |
| `/timeline` | World timeline |

## Key Directories

```
src/app/           — Next.js App Router pages
src/components/    — React components
src/db/            — Drizzle ORM schema + queries
  queries/         — Database query functions
src/types/         — TypeScript type definitions
scripts/           — Seed, search index generation, content scripts
```

## Common Commands

```bash
npm run dev              # Dev server
npm run build            # Generate search index + build
npm run start            # Production server
npm run lint             # ESLint
npm run db:push          # Push schema to database
npm run db:studio        # Drizzle Studio (DB browser)
npm run db:seed          # Seed database from scripts
npm run generate:search  # Rebuild search index
npx tsc --noEmit         # TypeScript check
```

## Content Guidelines (CRITICAL)

Peter is VERY particular about tone and lore accuracy:
- **Thaveus is the narrator** — all lore text should feel like it's written by an in-world chronicler
- **"Certa vez"** — only for standalone stories, never for serial chapters
- **Don't add titles to already-known characters** — if someone is established as "Kael", don't suddenly call them "Lord Kael" without lore justification
- **Timeline accuracy matters** — check existing timeline before adding events
- **Tone:** Epic fantasy, not generic D&D. Think Name of the Wind, not Monster Manual

## Database

- Drizzle ORM with PostgreSQL
- Schema in `src/db/`
- Queries in `src/db/queries/`
- Use `drizzle-kit push` for schema changes (not migrations in dev)

## Conventions

- English code, but content text may be in Portuguese (it's for a Brazilian D&D group)
- Server Components by default
- Iconify for icons (NOT Lucide — different from other projects)
- Tailwind for all styling
- Slug-based routing for all entity pages
