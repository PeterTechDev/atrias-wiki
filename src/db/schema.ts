import {
  pgTable,
  uuid,
  text,
  jsonb,
  boolean,
  timestamp,
  real,
  index,
  customType,
  integer,
  date,
} from 'drizzle-orm/pg-core'

// Custom type for pgvector
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)'
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value)
  },
})

export const entityTypeEnum = [
  'character',
  'place',
  'faction',
  'item',
  'lore',
  'monster',
  'session',
] as const

export type EntityType = (typeof entityTypeEnum)[number]

export const entityStatusEnum = ['draft', 'review', 'published'] as const

export type EntityStatus = (typeof entityStatusEnum)[number]

// Main entities table - all wiki content
export const entities = pgTable(
  'entities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').$type<EntityType>().notNull(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    image: text('image'), // URL to profile picture / cover image
    data: jsonb('data').$type<Record<string, unknown>>().default({}),
    embedding: vector('embedding'),
    isSpoiler: boolean('is_spoiler').default(false),
    status: text('status').$type<EntityStatus>().default('published'),
    sourceFile: text('source_file'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('entities_type_idx').on(table.type),
    index('entities_slug_idx').on(table.slug),
    index('entities_name_idx').on(table.name),
  ]
)

export type Entity = typeof entities.$inferSelect
export type NewEntity = typeof entities.$inferInsert

// Entity relations - graph connections
export const entityRelations = pgTable(
  'entity_relations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id')
      .notNull()
      .references(() => entities.id, { onDelete: 'cascade' }),
    relationType: text('relation_type').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    confidence: real('confidence').default(1.0),
  },
  (table) => [
    index('entity_relations_source_idx').on(table.sourceId),
    index('entity_relations_target_idx').on(table.targetId),
    index('entity_relations_type_idx').on(table.relationType),
  ]
)

export type EntityRelation = typeof entityRelations.$inferSelect
export type NewEntityRelation = typeof entityRelations.$inferInsert

// Knowledge chunks - for future RAG
export const knowledgeChunks = pgTable(
  'knowledge_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    source: text('source').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    embedding: vector('embedding'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('knowledge_chunks_source_idx').on(table.source),
  ]
)

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect
export type NewKnowledgeChunk = typeof knowledgeChunks.$inferInsert

// Ingestion jobs - pipeline tracking
export const ingestionJobs = pgTable('ingestion_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  status: text('status').notNull().default('pending'),
  inputType: text('input_type').notNull(),
  inputData: jsonb('input_data').$type<Record<string, unknown>>().default({}),
  extractedEntities: jsonb('extracted_entities').$type<unknown[]>().default([]),
  suggestedRelations: jsonb('suggested_relations').$type<unknown[]>().default([]),
  reviewQuestions: jsonb('review_questions').$type<unknown[]>().default([]),
  userResponses: jsonb('user_responses').$type<Record<string, unknown>>().default({}),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type IngestionJob = typeof ingestionJobs.$inferSelect
export type NewIngestionJob = typeof ingestionJobs.$inferInsert

// === Session Logs (Campaigns + Chapters) ===

export const campaignStatusEnum = ['active', 'completed', 'hiatus'] as const
export type CampaignStatus = (typeof campaignStatusEnum)[number]

export const sessionLogStatusEnum = ['draft', 'approved', 'published'] as const
export type SessionLogStatus = (typeof sessionLogStatusEnum)[number]

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  status: text('status').$type<CampaignStatus>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert

export const sessionLogs = pgTable(
  'session_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    chapterNumber: integer('chapter_number').notNull(),
    title: text('title').notNull(),
    rawRecap: text('raw_recap'),
    narration: text('narration').notNull(),
    datePlayed: date('date_played'),
    playersPresent: jsonb('players_present').$type<string[]>().default([]),
    locationsVisited: jsonb('locations_visited').$type<string[]>().default([]),
    npcsEncountered: jsonb('npcs_encountered').$type<string[]>().default([]),
    keyEvents: jsonb('key_events').$type<string[]>().default([]),
    status: text('status').$type<SessionLogStatus>().notNull().default('draft'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('session_logs_campaign_idx').on(table.campaignId),
    index('session_logs_chapter_idx').on(table.chapterNumber),
  ]
)

export type SessionLog = typeof sessionLogs.$inferSelect
export type NewSessionLog = typeof sessionLogs.$inferInsert
