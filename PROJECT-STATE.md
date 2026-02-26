# PROJECT-STATE.md — Átrias Wiki
*Last updated: 2026-02-25 by Kuroko 👻*

## Vision
A D&D wiki gift for Peter's Tuesday night campaign. 176 entities across 7 continents. Narrated by Thaveus Aeliorist. Two pillars: The World (linked entities) + The Log (voice → AI → wiki page).

Live: https://atrias-wiki.vercel.app
Repo: github.com/PeterTechDev/atrias-wiki

---

## Stack
- Next.js 16.1.6 (App Router), TypeScript
- Tailwind CSS 4
- **@iconify/react** (icons — NOT Lucide)
- Drizzle ORM + Neon PostgreSQL (pgvector 1536)
- OpenAI gpt-4o-mini (session processing) + Whisper (transcription)
- ElevenLabs George voice (narration audio)
- Dev: `PORT=3002 npm run dev:stable` (next build && next start — Turbopack + Tailscale crashes)

---

## What's Built & Working

| Route | Status | Notes |
|-------|--------|-------|
| `/characters/[slug]` | ✅ | Character detail pages |
| `/factions/[slug]` | ✅ | Faction detail pages |
| `/items/[slug]` | ✅ | Item detail pages |
| `/lore/[slug]` | ✅ | Lore pages |
| `/map` | ✅ | Interactive map with collapsible sidebar |
| `/monsters/[slug]` | ✅ | Monster entries |
| `/places/[slug]` | ✅ | Places/locations |
| `/sessions/[campaign]/[chapter]` | ✅ | Session recaps with audio narration |
| `/sessions/new` | ✅ | Session intake pipeline (Pena Mágica) |
| `/browse` | ✅ | Browse all entities |
| `/search` | ✅ | Search |
| `/timeline` | ✅ | Timeline view |

## DB Schema
- `entities` (type, slug, name, description, data, embedding vector(1536))
- `entityRelations` (source → target with relationship type)
- `knowledgeChunks` (pgvector search)
- `campaigns` (Missões da Guilda, Improváveis de Solária)
- `sessionLogs` (chapter narrations, raw recaps, metadata)

## Recent Work
- Chapter 1 "Cartão de Visitas" — published with audio
- Chapter 2 "O Verso do Cartão" — published Feb 24 with audio (commit af70bcc)
- Session intake pipeline (Pena Mágica) — built, Marvin + Ego cleared
- Thaveus voice: system prompt with full backstory, temp 0.7, quill-reveal CSS animation
- Responsive fixes for mobile (commit 5307780, 470459e)

## Open Items
- [x] Live test session intake — **PASSED** (Feb 25). API tested directly: quick mode returns 200 with full Thaveus narrative, entity matching, key events. Save route exists. Audio/text modes untested (need real recording). Note: service runs on port **3456**, not 3002.
- [ ] Phase 2: relationship graph (characters/factions/places linked visually)
- [ ] Hyperbolic Time Chamber (session prep hub) — was built, reverted, needs redesign
