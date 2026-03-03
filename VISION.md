# VISION.md — Átrias Wiki
*Locked: 2026-02-23 by Peter + Kuroko*

---

## What It Is

A living memory palace for 7 years of D&D. The whole party uses it — not just Peter. Every character, place, faction, and item linked and mapped. You open it and the adventures feel real and worth revisiting.

> "A place where we save our memories with good UX. Not just documents — images, maps, something dynamic."

---

## Two Core Pillars

### 1. The World
Everything in the Átrias universe — linked, mapped, cross-referenced. Click Santiago and see his relationships to Roan, to the guild, to the places they've been. Feels like a real fantasy encyclopedia, not a Google Doc.

### 2. The Log
After each session, someone records a quick voice recap. The AI transcribes it, extracts entities and relationships, and auto-generates a new wiki page — linked, formatted, ready to publish. Zero manual work. **This is the feature that makes the wiki stay alive.**

---

## AI Layer (Portfolio + Utility)

- **RAG + pgvector** — already in the DB. Semantic search over the entire Átrias universe.
- **Local embeddings** — Ollama for vector generation. Fast, free, no API calls.
- **API for generation** — session intake, entity extraction, page generation. ~$0.02/session. Not worth sacrificing quality for $1/year.
- **Local-first for retrieval** — everything the AI needs is in the DB. No external knowledge required.
- **Future: character conversations** — chat with Santiago, ask Thaveus about the lore. Phase 2, after core is solid.

This is a genuine portfolio piece: RAG pipeline, vector search, entity extraction, local inference. The architecture is what matters.

---

## "Done" Looks Like

You finish a session on Tuesday night. You record a 3-minute voice note on your phone. Five minutes later there's a new wiki page — entities linked, relationships mapped, ready to share in the group chat.

The party opens it, laughs at the recap, finds something they forgot, and someone says "wait, when did THAT happen?" — and the wiki has the answer.

---

## Phases

### Phase 1 — Session Intake Pipeline (MVP)
- Voice recording → Whisperbox transcription → AI extracts entities + relationships → generates wiki page
- This is the one feature that makes the wiki self-sustaining
- Ship this to the party. Their feedback shapes everything else.

### Phase 2 — Relationship Graph
- Visual graph of characters/factions/places and their connections
- The "wow" moment for the portfolio
- Data already exists in DB — frontend feature

### Phase 3 — Character Conversations
- Chat with characters in-character (Santiago, Thaveus, etc.)
- Needs solid model + rich character data
- Only after Phase 1+2 are solid

---

## Constraints
- **Local embeddings, API for generation** — best quality/cost balance
- **No scope creep** — one phase at a time
- **Party must actually use it** — UX over features
- **Portfolio-worthy architecture** — document the RAG pipeline, not just the UI

---

## Current State (Feb 2026)
- ✅ 176+ entities in PostgreSQL (Drizzle ORM + Neon)
- ✅ pgvector installed and ready
- ✅ Character, faction, place, item, lore, monster pages
- ✅ Interactive map (Leaflet)
- ✅ Session recap pages with audio (Ch 1 + Ch 2 live)
- ✅ Pre-generated search index
- ✅ Session intake pipeline shipped (Pena Mágica / Thaveus voice) — Phase 1 done
- ✅ Audio narration via ElevenLabs (George voice)
- ⏳ Relationship graph not yet built (Phase 2 — data ready, frontend pending)
- ⏳ Character conversations not yet built (Phase 3 — after Phase 2)
