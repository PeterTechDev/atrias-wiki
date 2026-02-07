# Átrias Wiki — AI-First Architecture

> Multi-agent system for intelligent content management.
> Self-hosted models, no token costs, full control.

## Vision

Replace traditional CMS forms with an AI-native content pipeline:
- Users dump content (text, audio, images, PDFs, character sheets)
- AI processes, extracts entities, makes connections
- AI asks clarifying questions if needed
- User reviews and publishes

---

## Content Input Modes

Users can add content in two ways:

### 1. Traditional Forms (Manual)
Standard wiki editing — fill in fields, upload images, link entities manually.
Good for precise control or quick edits.

### 2. ✨ Pena Mágica (Magic Quill)
AI-powered content input inspired by the Order of Scribes wizard ability.

> *"A Pena Mágica dança sobre o pergaminho, transformando pensamentos caóticos em conhecimento estruturado..."*

- Dump raw notes, voice memos, images, PDFs
- AI extracts entities, suggests connections
- Review and approve before publishing
- Perfect for session recaps, worldbuilding dumps, character backstories

**UX Flow:**
```
[Choose Input Type]
     │
     ├─→ 📝 Traditional Form
     │      └─→ Fill fields → Save
     │
     └─→ ✨ Pena Mágica
            └─→ Dump content → AI processes → Review → Publish
```

## Core Principles

1. **Own the model** — no per-token costs, control what runs
2. **Self-contained knowledge** — D&D books + Átrias content in vector DB
3. **Multi-agent orchestration** — learning playground for real patterns
4. **On-demand compute** — GPU costs only when running

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                               │
│         (text, audio, images, PDFs, character sheets)           │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CPU HOST (Always On)                          │
│                    Local Machine / VPS                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Next.js    │  │   Redis/     │  │  Postgres + pgvector   │ │
│  │   Wiki UI    │  │   BullMQ     │  │                        │ │
│  │   + Review   │  │   (Queue)    │  │  • Átrias entities     │ │
│  │   Interface  │  │              │  │  • D&D SRD content     │ │
│  └──────────────┘  └──────────────┘  │  • Embeddings          │ │
│                                       │  • Job state           │ │
│  ┌────────────────────────────────┐  └────────────────────────┘ │
│  │        ORCHESTRATOR            │                              │
│  │        (LangGraph)             │                              │
│  │                                │                              │
│  │  ┌─────────┐  ┌─────────────┐ │                              │
│  │  │Ingestor │  │  Extractor  │ │                              │
│  │  │ Agent   │→ │   Agent     │ │                              │
│  │  └─────────┘  └──────┬──────┘ │                              │
│  │                      ▼        │                              │
│  │  ┌─────────┐  ┌─────────────┐ │                              │
│  │  │Publisher│← │   Linker    │ │                              │
│  │  │ Agent   │  │   Agent     │ │                              │
│  │  └─────────┘  └──────┬──────┘ │                              │
│  │       ▲              ▼        │                              │
│  │  ┌─────────────────────────┐  │                              │
│  │  │    Reviewer Agent       │  │                              │
│  │  │  (asks clarifications)  │  │                              │
│  │  └─────────────────────────┘  │                              │
│  └────────────────────────────────┘                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Tailscale VPN
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GPU HOST (On-Demand)                          │
│                    RunPod / Vast.ai                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      vLLM Server                            │ │
│  │                                                             │ │
│  │  Model: Qwen-2.5-72B-Instruct (or Llama 3.1 70B)          │ │
│  │                                                             │ │
│  │  Endpoints:                                                 │ │
│  │  • POST /v1/chat/completions  (OpenAI compatible)          │ │
│  │  • POST /v1/embeddings        (for vectors)                │ │
│  │                                                             │ │
│  │  Cost: ~$0.40-0.50/hr (RTX 4090)                           │ │
│  │        ~$1.50/hr (A100 for 72B)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Whisper Server (Optional)                  │ │
│  │                  faster-whisper / whisper.cpp               │ │
│  │                  For audio transcription                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Knowledge Base Schema (Postgres + pgvector)

### Core Tables

```sql
-- All wiki entities (characters, places, items, etc.)
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,  -- character, place, faction, item, lore, monster, session
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    data JSONB NOT NULL,  -- flexible schema per type
    embedding vector(1536),  -- for semantic search
    is_spoiler BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',  -- draft, review, published
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships between entities
CREATE TABLE entity_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,  -- appears_in, located_in, member_of, owns, etc.
    metadata JSONB,
    confidence FLOAT DEFAULT 1.0,  -- AI confidence score
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, target_id, relation_type)
);

-- Reference knowledge (D&D books, rules, etc.)
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,  -- 'dnd-5e-srd', 'phb', 'dmg', 'atrias-lore'
    title TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,  -- page number, chapter, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion jobs (tracking pipeline state)
CREATE TABLE ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT DEFAULT 'pending',  -- pending, processing, review, completed, failed
    input_type TEXT,  -- text, audio, image, pdf
    input_data JSONB,  -- original content or file reference
    extracted_entities JSONB,  -- what AI found
    suggested_relations JSONB,  -- connections AI suggests
    review_questions JSONB,  -- clarifications needed
    user_responses JSONB,  -- answers to questions
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_embedding ON entities USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_relations_source ON entity_relations(source_id);
CREATE INDEX idx_relations_target ON entity_relations(target_id);
```

### Entity Data Schemas (JSONB)

```typescript
// Character
{
  aliases: string[],
  race: string,
  class: string,
  status: 'alive' | 'dead' | 'unknown',
  description: string,
  history: string,
  portrait_url: string,
  dm_notes: string  // never shown to players
}

// Place
{
  place_type: 'continent' | 'region' | 'city' | 'district' | 'building' | 'dungeon',
  parent_slug: string,  // for hierarchy
  description: string,
  history: string,
  map_url: string
}

// Item
{
  item_type: 'weapon' | 'armor' | 'artifact' | 'wondrous' | 'consumable',
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary',
  description: string,
  properties: string,  // mechanical properties
  history: string
}

// Faction
{
  faction_type: 'kingdom' | 'guild' | 'religion' | 'secret_society' | 'military',
  symbol_url: string,
  goals: string,
  secrets: string,  // DM only
  description: string
}

// Lore
{
  lore_type: 'historical_event' | 'legend' | 'prophecy' | 'era',
  date: string,  // in-world date
  era: string,
  description: string
}

// Monster
{
  monster_type: 'beast' | 'undead' | 'fiend' | 'aberration' | 'unique',
  challenge: string,
  description: string,
  abilities: string,
  lore: string
}

// Session
{
  session_number: number,
  real_date: string,
  in_game_date: string,
  summary: string,
  key_events: string[]
}
```

---

## Agent Responsibilities

### 1. Ingestor Agent

**Purpose:** Accept raw input and normalize it

**Input:**
- Text (raw notes, descriptions)
- Audio (voice memos, session recordings)
- Images (character art, maps, handwritten notes)
- PDFs (character sheets, rulebooks)

**Process:**
1. Detect input type
2. Transcribe audio → text (via Whisper)
3. OCR images if needed
4. Extract text from PDFs
5. Chunk long content
6. Generate embeddings
7. Store in `ingestion_jobs`

**Output:**
- Normalized text content
- Metadata (source type, timestamps)
- Initial embeddings

**Tools:**
- Whisper (audio)
- Tesseract or PaddleOCR (images)
- pdf-parse (PDFs)
- Embedding model

---

### 2. Extractor Agent

**Purpose:** Identify entities and structured data from text

**Input:**
- Normalized text from Ingestor

**Process:**
1. Query knowledge base for context (RAG)
2. Prompt LLM to identify entities
3. Extract structured fields per entity type
4. Assign confidence scores
5. Handle multiple entities in one input

**Output:**
```json
{
  "entities": [
    {
      "type": "character",
      "name": "Vaelor",
      "confidence": 0.95,
      "data": {
        "race": "Human",
        "class": "Paladin",
        "description": "..."
      }
    }
  ]
}
```

**Prompt Pattern:**
```
You are an entity extractor for a D&D wiki.
Given the following text and context from our knowledge base,
identify all entities (characters, places, items, factions, etc.)
and extract their attributes.

Context from knowledge base:
{retrieved_chunks}

Text to analyze:
{input_text}

Return JSON with entities array...
```

---

### 3. Linker Agent

**Purpose:** Find relationships between entities

**Input:**
- Extracted entities from Extractor
- Existing entities in database

**Process:**
1. Vector search for similar entities (dedup check)
2. Identify if entity already exists (merge vs create)
3. Find relationships mentioned in text
4. Infer relationships from context
5. Query knowledge base for canonical relationships

**Output:**
```json
{
  "entity_matches": [
    {"new_entity": "Vaelor", "existing_id": null, "action": "create"},
    {"new_entity": "Ordem do Cálice", "existing_id": "uuid-123", "action": "link"}
  ],
  "relations": [
    {"source": "Vaelor", "target": "Ordem do Cálice", "type": "member_of", "confidence": 0.9},
    {"source": "Vaelor", "target": "Espada do Juramento", "type": "owns", "confidence": 0.85}
  ]
}
```

---

### 4. Reviewer Agent

**Purpose:** Validate completeness and ask clarifying questions

**Input:**
- Extracted entities
- Suggested relations
- Schema requirements

**Process:**
1. Check required fields per entity type
2. Identify ambiguities (e.g., "is this a city or a region?")
3. Check for potential duplicates
4. Validate spoiler levels
5. Generate questions for user

**Output:**
```json
{
  "status": "needs_review",
  "questions": [
    {"field": "place_type", "question": "Is 'Solaria' a city or a region?", "options": ["city", "region"]},
    {"field": "is_spoiler", "question": "Should 'Vaelor's death' be hidden from players?", "options": [true, false]}
  ],
  "warnings": [
    "Entity 'Vaelor' might be duplicate of existing 'Sir Vaelor the Bright'"
  ]
}
```

---

### 5. Publisher Agent

**Purpose:** Write finalized entities to database

**Input:**
- Validated entities
- Confirmed relations
- User responses to questions

**Process:**
1. Merge user responses into entity data
2. Generate final embeddings
3. Create/update entities in database
4. Create relationship records
5. Update search indexes
6. Trigger any webhooks (optional)

**Output:**
- Created entity IDs
- Updated entity IDs
- Publish status

---

## Orchestration Flow (LangGraph)

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  Ingestor   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  Extractor  │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   Linker    │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
              ┌─────│  Reviewer   │─────┐
              │     └─────────────┘     │
              ▼                         ▼
     [needs_review]              [ready_to_publish]
              │                         │
              ▼                         ▼
     ┌─────────────┐            ┌─────────────┐
     │ WAIT USER   │            │  Publisher  │
     │  RESPONSE   │            └──────┬──────┘
     └──────┬──────┘                   │
            │                          ▼
            │                   ┌─────────────┐
            └──────────────────►│    END      │
                                └─────────────┘
```

---

## GPU Host Setup (vLLM + RunPod)

### Option 1: RunPod Serverless (Recommended for learning)
- Pay per second of compute
- Auto-scales to zero when not in use
- Pre-built vLLM templates available

### Option 2: RunPod Pod (Dedicated)
- Fixed hourly rate
- Always available (while running)
- More control over configuration

### vLLM Setup

```bash
# On GPU host
pip install vllm

# Start server with Qwen
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2.5-72B-Instruct \
    --port 8000 \
    --host 0.0.0.0  # Only if behind Tailscale!
```

### Security (Tailscale)

```bash
# On both hosts
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# GPU host will get IP like 100.x.x.x
# CPU host calls: http://100.x.x.x:8000/v1/chat/completions
```

### Cost Estimates

#### GPU Hourly Rates (RunPod)

| GPU | VRAM | Best For | $/hr |
|-----|------|----------|------|
| RTX 4090 | 24GB | 7B-32B models | $0.44 |
| RTX A6000 | 48GB | Up to 70B (quantized) | $0.79 |
| A100 80GB | 80GB | 70B+ full precision | $1.49 |

**Recommendation:** Start with RTX 4090 + Qwen 2.5 32B or Llama 3.1 8B. Upgrade if needed.

#### Phase-Based Cost Projection

**Phase 1: Initial Content Load (Weeks 1-4)**
- 315+ files to process
- Heavy testing and prompt iteration
- Estimated: 4-6 hrs/day on weekends, 1-2 hrs/day weekdays

| Week | Hours | Cost (4090) |
|------|-------|-------------|
| 1 | 20 | $9 |
| 2 | 25 | $11 |
| 3 | 20 | $9 |
| 4 | 15 | $7 |
| **Total** | **80 hrs** | **~$36** |

**Phase 2: Active Development (Months 2-3)**
- Tuning agents, fixing edge cases
- Adding missed content
- Estimated: 2-3 hrs/day when working on it

| Month | Hours | Cost (4090) |
|-------|-------|-------------|
| Month 2 | 50 | $22 |
| Month 3 | 40 | $18 |

**Phase 3: Maintenance (Ongoing)**
- Occasional new content
- Session log processing after D&D nights
- Estimated: 2-4 hrs/week

| Pattern | Monthly Hours | Cost (4090) |
|---------|---------------|-------------|
| Light (1 session/week) | 4-8 | $2-4 |
| Normal (after each D&D) | 8-12 | $4-6 |
| Heavy (active worldbuilding) | 20-30 | $9-14 |

#### Total First-Year Estimate

| Phase | Duration | Cost |
|-------|----------|------|
| Initial Load | 1 month | ~$40 |
| Development | 2 months | ~$40 |
| Maintenance | 9 months | ~$45 |
| **Year 1 Total** | | **~$125** |

Compare to API costs: Processing 315 files with GPT-4o would cost ~$50-100 just for initial extraction, plus ongoing costs for every interaction.

---

### On-Demand Architecture Pattern

**Key Principle:** GPU costs money only when running. Design for cold starts.

```
USER ACTION                    GPU STATE
────────────────────────────────────────────
Browsing wiki                  OFF (Postgres serves reads)
Adding new content             STARTING (~30s cold start)
Processing pipeline            RUNNING (pay per second)
Pipeline complete              STOPPING (auto after idle)
Back to browsing               OFF
```

**Implementation:**

1. **RunPod Serverless** (Recommended)
   - Zero cost when idle
   - ~30s cold start
   - Auto-scales based on queue
   - Perfect for batch processing

2. **Spot Instances** (Alternative)
   - Even cheaper (~50% discount)
   - Can be interrupted
   - Good for non-urgent batch jobs

3. **Pod with Auto-Stop**
   - Start manually or via API
   - Auto-stop after X minutes idle
   - Predictable availability

**Wake-on-Demand Flow:**

```typescript
async function processContent(input: ContentInput) {
  // 1. Queue the job locally
  await db.insertJob({ status: 'pending', input });
  
  // 2. Wake GPU if not running
  const gpuStatus = await runpod.getStatus();
  if (gpuStatus === 'stopped') {
    await runpod.start();
    await waitForHealthy(); // ~30s
  }
  
  // 3. Process
  const result = await callPipeline(input);
  
  // 4. GPU auto-stops after idle timeout
  return result;
}
```

**Cost Optimization Tips:**

1. **Batch content** — Don't process one file at a time. Collect content, process in batches
2. **Smaller models first** — Start with 8B for testing, 32B for production
3. **Local embeddings** — Use CPU-based embedding model (e5-small) for vectors
4. **Cache aggressively** — Store extracted entities, don't re-extract

---

## Migration Path

### Phase 1: Foundation (Week 1-2)
- Set up Postgres + pgvector locally
- Load D&D SRD content
- Import existing Átrias entities
- Build embedding pipeline

### Phase 2: GPU Infrastructure (Week 3)
- Set up RunPod account
- Deploy vLLM with Qwen/Llama
- Configure Tailscale
- Test API connectivity

### Phase 3: First Agents (Week 4-5)
- Build Ingestor Agent
- Build Extractor Agent
- Test with real content

### Phase 4: Relationships (Week 6)
- Build Linker Agent
- Implement dedup logic
- Test relationship extraction

### Phase 5: Review Flow (Week 7)
- Build Reviewer Agent
- Create review UI in Next.js
- User feedback loop

### Phase 6: Polish (Week 8+)
- Build Publisher Agent
- Full pipeline testing
- Performance optimization
- Documentation

---

## Files to Update

- [x] `docs/AI_FIRST_ARCHITECTURE.md` (this file)
- [x] `PLANNING.md` — add AI-first section
- [x] `README.md` — update project description
- [ ] GitHub Issues — create milestone and issues

---

## Phase 1 Implementation Notes (2026-02-04)

### Completed

**Database Setup:**
- PostgreSQL with pgvector extension via Docker Compose
- Drizzle ORM for type-safe queries
- All 4 tables implemented: `entities`, `entity_relations`, `knowledge_chunks`, `ingestion_jobs`

**Schema Implementation (`src/db/schema.ts`):**
```typescript
// Custom vector type for pgvector
const vector = customType<{ data: number[]; dpiverName: 'vector' }>({...})

// Entity types supported: character, place, faction, item, lore, monster, session
// JSONB data field for flexible per-type schema
// 1536-dimension vector field ready for embeddings
```

**Query Functions (`src/db/queries/`):**
- `getEntityBySlug(type, slug)` - Single entity lookup
- `getEntitiesByType(type)` - List entities by type
- `getEntityCounts()` - Stats for home page
- `searchEntities(query)` - ILIKE-based text search

**Seeding:**
- Script: `scripts/seed-database.ts`
- Source: `import-output/entities.json` (125+ entities)
- Generates slugs with duplicate handling
- Creates entity relations from mentions array

**Pages Migrated:**
- All list pages (characters, places, factions, items, lore, monsters)
- All detail pages ([slug] routes)
- Search page (via API route)
- Home page (stats from database)

### Decisions Made

1. **Sanity removed entirely** - No fallback, clean break to Postgres
2. **Vector field placeholder** - 1536 dimensions ready, embeddings not yet generated
3. **Simple text search** - Using ILIKE for now, will switch to vector search later
4. **Relations from mentions** - Created during seeding from extracted mentions

### Next Steps

- Phase 2: Set up GPU infrastructure (RunPod + vLLM)
- Generate embeddings for all entities
- Implement vector-based semantic search

---

## Open Questions

1. ~~Keep Sanity as fallback or remove entirely?~~ **Removed entirely**
2. Which model to start with? (Qwen 2.5 72B vs Llama 3.1 70B)
3. Local Whisper or GPU-hosted Whisper?
4. LangGraph vs custom orchestration?
