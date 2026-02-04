# Átrias Wiki — Project Planning

> A Wikipedia-style wiki for the Átrias RPG universe.  
> Built as a surprise gift for the DM who created this world.

## 📊 Content Scale (Discovered 2026-02-03)

This is bigger than expected — a **full world** with:
- **7 Continents**: Skeld, Vellenor, Noan, Elandir, Kandar, Ohan, Morte Gelida
- **18+ Location Maps** including 8K world map
- **2 Full Campaigns** with multiple seasons
- **4 One-Shot Adventures**
- **5+ Unique Monsters**
- **15+ Lore Documents** (races, magic, history, factions)
- **Multiple Deities**: A Chama Branca, A Chama de Prata, Uther, Ghalbath

See `CONTENT_INVENTORY.md` for full breakdown.

## 🎯 Project Goals

1. **Primary**: Create a beautiful, functional wiki for the Átrias RPG group
2. **Secondary**: Portfolio showcase piece demonstrating modern web dev skills
3. **Tertiary**: Surprise and honor the DM's creative work

## 👥 Users & Roles

| Role | Can View | Can Edit | Notes |
|------|----------|----------|-------|
| **Visitor** | Public content | ❌ | Anonymous browsing |
| **Player** | Public content (no spoilers) | ❌ | Authenticated, sees "revealed" content only |
| **DM** | Everything | ✅ | Full access, manages spoilers |

## 🔒 Content Visibility System

```
┌─────────────────────────────────────────────────┐
│                Content States                    │
├─────────────────────────────────────────────────┤
│  DRAFT      → Only DM sees (in Sanity Studio)   │
│  SPOILER    → Published but hidden from players │
│  PUBLIC     → Everyone can see                  │
└─────────────────────────────────────────────────┘
```

- **DM Notes field**: Never rendered on public site (internal reference only)
- **Spoiler content**: Exists in DB but filtered out for non-DM users
- When DM "reveals" spoiler → becomes PUBLIC

## 📦 Content Schema

### Characters
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| slug | slug | Auto from name |
| aliases | string[] | Other names/titles |
| type | enum | PC / NPC / Deity / Creature |
| race | string | |
| class | string | If applicable |
| affiliation | ref → Faction | |
| location | ref → Place | Current location |
| birthplace | ref → Place | |
| description | rich text | Wiki-style with links |
| history | rich text | |
| portrait | image | |
| status | enum | Alive / Dead / Unknown / Spoiler |
| dmNotes | text | Hidden from players |
| isSpoiler | boolean | Visibility control |
| relatedCharacters | ref[] → Character | |
| appearedInSessions | ref[] → Session | |

### Places
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| slug | slug | |
| type | enum | Continent / Region / City / District / Building / Dungeon / Plane / Other |
| parentLocation | ref → Place | Hierarchy (City → Region → Continent) |
| description | rich text | |
| history | rich text | |
| notableResidents | ref[] → Character | |
| image | image | |
| map | image | Optional map/layout |
| dmNotes | text | |
| isSpoiler | boolean | |

### Factions
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| slug | slug | |
| type | enum | Kingdom / Guild / Religion / Secret Society / Military / Other |
| symbol | image | Emblem/logo |
| headquarters | ref → Place | |
| leader | ref → Character | |
| members | ref[] → Character | Notable members |
| goals | text | Public objectives |
| secrets | text | DM only |
| description | rich text | |
| dmNotes | text | |
| isSpoiler | boolean | |

### Items
| Field | Type | Notes |
|-------|------|-------|
| name | string | |
| slug | slug | |
| type | enum | Weapon / Armor / Artifact / Wondrous / Consumable / Other |
| rarity | enum | Common / Uncommon / Rare / Very Rare / Legendary / Artifact |
| currentOwner | ref → Character | |
| previousOwners | ref[] → Character | History of ownership |
| location | ref → Place | If not owned |
| description | rich text | |
| properties | rich text | Mechanical properties |
| history | rich text | |
| image | image | |
| dmNotes | text | |
| isSpoiler | boolean | |

### Lore (Events / History)
| Field | Type | Notes |
|-------|------|-------|
| title | string | |
| slug | slug | |
| type | enum | Historical Event / Legend / Prophecy / Era / Other |
| date | object | Átrias calendar date |
| era | string | Named era if applicable |
| description | rich text | |
| relatedCharacters | ref[] → Character | |
| relatedPlaces | ref[] → Place | |
| relatedFactions | ref[] → Faction | |
| dmNotes | text | |
| isSpoiler | boolean | |

### Sessions (Game Logs)
| Field | Type | Notes |
|-------|------|-------|
| number | number | Session # |
| title | string | Optional session title |
| realDate | date | IRL date played |
| inGameDate | object | Átrias calendar |
| summary | rich text | What happened |
| charactersPresent | ref[] → Character | PCs + relevant NPCs |
| locationsVisited | ref[] → Place | |
| keyEvents | ref[] → Lore | Links to events that occurred |
| dmNotes | text | |
| isSpoiler | boolean | |

### Átrias Calendar (TBD)
> Waiting for content from Peter to define calendar structure
> Will include: months, days, eras, current year, etc.

### Monsters (NEW - discovered from content)
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| slug | slug | |
| type | enum | Beast / Undead / Fiend / Aberration / Unique |
| challenge | string | CR or custom difficulty |
| description | block content | |
| abilities | block content | Special abilities |
| lore | block content | In-world history |
| image | image | |
| location | ref → Place | Where it's found |
| dmNotes | text | |
| isSpoiler | boolean | |

### Adventures (NEW - discovered from content)
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| slug | slug | |
| type | enum | One-Shot / Campaign / Arc |
| level | string | Recommended level range |
| synopsis | text | Short summary (no spoilers) |
| fullDescription | block content | DM-only full details |
| locations | ref[] → Place | |
| keyNPCs | ref[] → Character | |
| relatedAdventures | ref[] → Adventure | |
| image | image | Cover art |
| dmNotes | text | |
| isSpoiler | boolean | Always true until completed |

## 🖥️ Pages & Routes

```
/                       → Home (intro, recent updates, featured)
/characters             → Character list (filterable)
/characters/[slug]      → Character detail
/places                 → Places list (hierarchy view option)
/places/[slug]          → Place detail
/factions               → Factions list
/factions/[slug]        → Faction detail
/items                  → Items list
/items/[slug]           → Item detail
/lore                   → Timeline / Lore entries
/lore/[slug]            → Lore detail
/sessions               → Session log
/sessions/[number]      → Session detail
/search                 → Global search
```

## ✨ Key Features

### Must Have (MVP)
- [x] All content types in database
- [x] Public pages for all content types
- [ ] Spoiler system (hide/reveal content)
- [ ] Wiki-style linking between entries
- [ ] Hover preview cards on links
- [x] Search functionality
- [x] Mobile responsive
- [x] Dark fantasy theme

### Nice to Have (v1.1)
- [ ] **Interactive world map** (HIGH PRIORITY - we have 8K map!)
  - Zoomable/pannable
  - Click regions → see info
  - Drill down: Continent → Region → City → Locations
  - Hover previews on markers
- [ ] Character relationship graph
- [ ] Timeline visualization
- [ ] Átrias calendar widget
- [ ] Recent changes feed
- [ ] Print-friendly character sheets
- [ ] Adventure browser (filter by level, type)

### Future Ideas
- [ ] Player authentication (see personalized content)
- [ ] Session planning tools for DM
- [ ] Random encounter/NPC generator
- [ ] Shared party inventory

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 15 (App Router) | SSG, great DX, portfolio-worthy |
| Database | PostgreSQL + pgvector | Flexible JSONB, vector search ready |
| ORM | Drizzle ORM | Type-safe, lightweight |
| Styling | Tailwind CSS | Fast, utility-first |
| Hosting | Vercel | Free, automatic deploys |

## 🎨 Design Direction

- **Theme**: Dark fantasy (think Baldur's Gate, Elden Ring vibes)
- **Colors**: Deep purples, golds, parchment textures
- **Typography**: Serif headers (fantasy feel), clean sans body
- **Cards**: Subtle borders, hover effects, preview popups
- **Mobile**: Hamburger nav, touch-friendly cards

## 📁 Project Structure

```
atrias-wiki/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── characters/
│   │   ├── places/
│   │   ├── factions/
│   │   ├── items/
│   │   ├── lore/
│   │   ├── monsters/
│   │   ├── sessions/
│   │   ├── search/
│   │   ├── api/                # API routes
│   │   └── page.tsx            # Home
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── wiki/               # Wiki-specific components
│   ├── db/
│   │   ├── index.ts            # Database client
│   │   ├── schema.ts           # Drizzle table definitions
│   │   └── queries/            # Query functions
│   └── types/
│       └── entities.ts         # TypeScript type definitions
├── scripts/
│   └── seed-database.ts        # Database seeding
├── import-output/
│   └── entities.json           # Extracted entity data
├── docker-compose.yml          # PostgreSQL + pgvector
├── drizzle.config.ts           # Drizzle ORM config
└── public/
    └── fonts/
```

## 📅 Milestones

### M1: Foundation ✅
- Project setup (Next.js + PostgreSQL)
- Database schemas for all content types
- Drizzle ORM integration
- Deploy empty shell to Vercel

### M2: Core Content ✅
- All list pages
- All detail pages
- Basic styling/theme
- Database seeding from extracted entities

### M3: Wiki Features
- Wiki-style linking
- Hover preview cards
- [x] Search functionality
- [x] Mobile responsive

### M4: Polish
- Final design polish
- Performance optimization
- SEO & meta tags
- [x] README & documentation

### M5: Content Population ✅
- [x] Import DM's content (125+ entities extracted)
- The big reveal! 🎉

## 📝 Notes

- This is a surprise for the DM — don't leak!
- Peter will gather existing content from DM's notes
- Calendar system TBD when we have examples
- Can add more entity types as we discover them

---

## Content Inbox

> Paste any content Peter shares here for processing later

*(empty)*

---

*Last updated: 2026-02-03*

---

## 🤖 AI-First Architecture (2026-02-04)

> Major architectural evolution: from traditional CMS to AI-native content pipeline.

See full details in `docs/AI_FIRST_ARCHITECTURE.md`

### Phase 1: Database Migration ✅ (Completed 2026-02-04)

- [x] Removed Sanity CMS completely
- [x] Set up PostgreSQL + pgvector via Docker
- [x] Created Drizzle ORM schema (entities, relations, knowledge_chunks, ingestion_jobs)
- [x] Migrated all pages to query Postgres
- [x] Seeded database from extracted entities (125+ entities)

### Vision

Replace form-based content entry with intelligent content processing:
- Users dump content (text, audio, images, PDFs, character sheets)
- Multi-agent pipeline processes and extracts entities
- AI finds connections between entities automatically
- Review UI for validation and clarification
- One-click publish

### Key Principles

1. **Own the model** — self-hosted LLM, no per-token costs
2. **Self-contained knowledge** — D&D books + Átrias content in vector DB
3. **Multi-agent orchestration** — real production patterns
4. **On-demand compute** — GPU costs only when running

### Architecture Summary

```
CPU Host (Local/VPS)          GPU Host (RunPod)
├── Next.js UI                ├── vLLM Server
├── Postgres + pgvector       │   └── Qwen 2.5 72B
├── Redis (queues)            └── Whisper (optional)
└── Multi-Agent Orchestrator
    ├── Ingestor Agent
    ├── Extractor Agent
    ├── Linker Agent
    ├── Reviewer Agent
    └── Publisher Agent
```

### Migration Path

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Postgres + pgvector + schema | ✅ Complete |
| 2 | GPU infrastructure (vLLM + Tailscale) | Pending |
| 3 | Ingestor + Extractor agents | Pending |
| 4 | Linker agent + dedup | Pending |
| 5 | Reviewer agent + UI | Pending |
| 6 | Publisher + polish | Pending |
