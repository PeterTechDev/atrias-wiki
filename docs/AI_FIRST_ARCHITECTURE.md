# Átrias Wiki — AI-First Architecture

> Multi-agent system for intelligent content management.
> Self-hosted models, no token costs, full control.

## Vision

Replace traditional CMS forms with an AI-native content pipeline:
- Users dump content (text, audio, images, PDFs, character sheets)
- AI processes, extracts entities, makes connections
- AI asks clarifying questions if needed
- User reviews and publishes

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

| Usage Pattern | Monthly Cost |
|---------------|--------------|
| 2 hrs/day development | ~$25-40 |
| 4 hrs/day active | ~$50-80 |
| 8 hrs/day heavy | ~$100-160 |

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
- [ ] `PLANNING.md` — add AI-first section
- [ ] `README.md` — update project description
- [ ] GitHub Issues — create milestone and issues

---

## Open Questions

1. Keep Sanity as fallback or remove entirely?
2. Which model to start with? (Qwen 2.5 72B vs Llama 3.1 70B)
3. Local Whisper or GPU-hosted Whisper?
4. LangGraph vs custom orchestration?
