import { and, count, eq, inArray, isNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type Entity, type EntityStatus, type EntityType } from '@/db/schema'
import type { EntityCounts } from '@/types/entities'
import { mergeEntityData, normalizeArchivedIds } from './entityEditing'

export const wikiEntityTypes = ['character', 'place', 'faction', 'item', 'lore', 'monster', 'other'] as const
export type WikiEntityType = (typeof wikiEntityTypes)[number]
export type EntityWriter = { source: 'member' | 'admin'; userId?: string }

export class EntityWriteError extends Error {
  constructor(public code: 'invalid' | 'not_found' | 'conflict' | 'duplicate', message: string) {
    super(message)
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isWikiType(value: unknown): value is WikiEntityType {
  return typeof value === 'string' && (wikiEntityTypes as readonly string[]).includes(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validateText(value: string, label: string, max: number) {
  if (!value.trim() || value.length > max) {
    throw new EntityWriteError('invalid', `${label} is invalid.`)
  }
}

function validateEntityInput(input: { type: unknown; name: string; slug: string; description?: string | null; data?: unknown }) {
  if (!isWikiType(input.type)) throw new EntityWriteError('invalid', 'Invalid entity type.')
  validateText(input.name, 'Name', 200)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 160) {
    throw new EntityWriteError('invalid', 'Slug must contain lowercase letters, numbers, and hyphens.')
  }
  if (input.description !== undefined && input.description !== null && input.description.length > 100000) {
    throw new EntityWriteError('invalid', 'Description is too long.')
  }
  if (input.data !== undefined && !isRecord(input.data)) throw new EntityWriteError('invalid', 'Data must be an object.')
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function duplicateError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  return message.includes('duplicate key') || message.includes('unique') || message.includes('entities_slug')
}

export async function createEntity(
  input: { type: WikiEntityType; name: string; slug: string; description?: string | null; status?: EntityStatus; data?: Record<string, unknown> },
  writer: EntityWriter
) {
  validateEntityInput(input)
  if (input.status !== undefined && !['draft', 'review', 'published'].includes(input.status)) {
    throw new EntityWriteError('invalid', 'Invalid entity status.')
  }
  if (writer.source === 'member' && (!writer.userId || !isUuid(writer.userId))) {
    throw new EntityWriteError('invalid', 'Invalid editor identity.')
  }

  try {
    const [created] = await db.insert(entities).values({
      type: input.type,
      name: input.name.trim(),
      slug: input.slug,
      description: input.description?.trim() || null,
      data: input.data ?? {},
      status: writer.source === 'member' ? 'published' : input.status ?? 'published',
      updatedAt: new Date(),
      updatedBy: writer.userId ?? null,
      updatedBySource: writer.source,
      revision: 1,
    }).returning()
    return created
  } catch (error) {
    if (duplicateError(error)) throw new EntityWriteError('duplicate', 'An entity with this slug already exists.')
    throw error
  }
}

export async function updateEntity(input: {
  id: string
  name?: string
  slug?: string
  description?: string | null
  status?: EntityStatus
  data?: Record<string, unknown>
  expectedRevision?: number
}, writer: EntityWriter) {
  if (!isUuid(input.id)) throw new EntityWriteError('invalid', 'Invalid entity id.')
  if (writer.source === 'member' && (!writer.userId || !isUuid(writer.userId))) {
    throw new EntityWriteError('invalid', 'Invalid editor identity.')
  }
  if (input.expectedRevision !== undefined && (!Number.isInteger(input.expectedRevision) || input.expectedRevision < 1)) {
    throw new EntityWriteError('invalid', 'Invalid revision.')
  }

  const [current] = await db.select().from(entities).where(eq(entities.id, input.id)).limit(1)
  if (!current) throw new EntityWriteError('not_found', 'Entity not found.')
  if (writer.source === 'member' && !isWikiType(current.type)) {
    throw new EntityWriteError('invalid', 'This entity cannot be edited by members.')
  }

  const nextName = input.name === undefined ? current.name : input.name.trim()
  const nextSlug = input.slug === undefined ? current.slug : input.slug.trim()
  const nextDescription = input.description === undefined ? current.description : input.description?.trim() || null
  const nextData = input.data === undefined ? (current.data ?? {}) : mergeEntityData((current.data ?? {}) as Record<string, unknown>, input.data)
  validateEntityInput({ type: current.type, name: nextName, slug: nextSlug, description: nextDescription, data: nextData })
  if (input.status !== undefined && !['draft', 'review', 'published'].includes(input.status)) {
    throw new EntityWriteError('invalid', 'Invalid entity status.')
  }
  const nextStatus = input.status ?? current.status

  if (current.name === nextName && current.slug === nextSlug && current.description === nextDescription && current.status === nextStatus && sameJson(current.data ?? {}, nextData)) {
    return current
  }

  const conditions = [eq(entities.id, input.id)]
  if (input.expectedRevision !== undefined) conditions.push(eq(entities.revision, input.expectedRevision))

  try {
    const [updated] = await db.update(entities).set({
      name: nextName,
      slug: nextSlug,
      description: nextDescription,
      status: nextStatus,
      data: nextData,
      updatedAt: new Date(),
      updatedBy: writer.userId ?? null,
      updatedBySource: writer.source,
      revision: sql`${entities.revision} + 1`,
    }).where(and(...conditions)).returning()

    if (!updated) {
      if (input.expectedRevision !== undefined) throw new EntityWriteError('conflict', 'This page changed while you were editing it. Reload it and review your changes.')
      throw new EntityWriteError('not_found', 'Entity not found.')
    }
    return updated
  } catch (error) {
    if (error instanceof EntityWriteError) throw error
    if (duplicateError(error)) throw new EntityWriteError('duplicate', 'An entity with this slug already exists.')
    throw error
  }
}

export async function getEntityBySlug(
  type: EntityType,
  slug: string
): Promise<Entity | null> {
  try {
    const result = await db
      .select()
      .from(entities)
      .where(and(eq(entities.type, type), eq(entities.slug, slug), isNull(entities.archivedAt)))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error(`Failed to fetch ${type} with slug "${slug}":`, error)
    throw new Error(`Unable to load ${type}. Please try again later.`)
  }
}

export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
  try {
    return await db
      .select()
      .from(entities)
      .where(and(eq(entities.type, type), isNull(entities.archivedAt)))
      .orderBy(entities.name)
  } catch (error) {
    console.error(`Failed to fetch entities of type "${type}":`, error)
    throw new Error(`Unable to load ${type} list. Please try again later.`)
  }
}

export async function getAllEntities(): Promise<Entity[]> {
  try {
    return await db.select().from(entities).where(isNull(entities.archivedAt)).orderBy(entities.name)
  } catch (error) {
    console.error('Failed to fetch all entities:', error)
    throw new Error('Unable to load entities. Please try again later.')
  }
}

export async function getEntityById(id: string): Promise<Entity | null> {
  try {
    const result = await db
      .select()
      .from(entities)
      .where(and(eq(entities.id, id), isNull(entities.archivedAt)))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error(`Failed to fetch entity with id "${id}":`, error)
    throw new Error('Unable to load entity. Please try again later.')
  }
}

export async function getEntityCounts(): Promise<EntityCounts> {
  try {
    const counts = await db
      .select({
        type: entities.type,
        count: count(),
      })
      .from(entities)
      .where(isNull(entities.archivedAt))
      .groupBy(entities.type)

    const countMap: Record<string, number> = {}
    let total = 0

    for (const row of counts) {
      countMap[row.type] = row.count
      total += row.count
    }

    return {
      characters: countMap['character'] ?? 0,
      places: countMap['place'] ?? 0,
      factions: countMap['faction'] ?? 0,
      items: countMap['item'] ?? 0,
      lore: countMap['lore'] ?? 0,
      monsters: countMap['monster'] ?? 0,
      others: countMap['other'] ?? 0,
      sessions: countMap['session'] ?? 0,
      total,
    }
  } catch (error) {
    console.error('Failed to fetch entity counts:', error)
    throw new Error('Unable to load statistics. Please try again later.')
  }
}

export async function getArchivedEntities() {
  return db.select().from(entities).where(and(inArray(entities.type, wikiEntityTypes), sql`${entities.archivedAt} is not null`)).orderBy(entities.archivedAt, entities.name)
}

export async function getArchivedEntityBySlug(type: WikiEntityType, slug: string) {
  const [entity] = await db.select().from(entities).where(and(eq(entities.type, type), eq(entities.slug, slug), sql`${entities.archivedAt} is not null`)).limit(1)
  return entity ?? null
}

export async function getEntityIncludingArchived(id: string) {
  const [entity] = await db.select().from(entities).where(eq(entities.id, id)).limit(1)
  return entity ?? null
}

export async function archiveEntity(id: string, userId: string) {
  if (!isUuid(id) || !isUuid(userId)) throw new EntityWriteError('invalid', 'Invalid entity id.')
  const [updated] = await db.update(entities).set({
    archivedAt: new Date(),
    updatedAt: new Date(),
    updatedBy: userId,
    updatedBySource: 'member',
    revision: sql`${entities.revision} + 1`,
  }).where(and(eq(entities.id, id), inArray(entities.type, wikiEntityTypes), isNull(entities.archivedAt))).returning()
  if (updated) return updated
  const [existing] = await db.select().from(entities).where(eq(entities.id, id)).limit(1)
  if (!existing || !isWikiType(existing.type)) throw new EntityWriteError('not_found', 'Entity not found.')
  if (existing.archivedAt) return existing
  throw new EntityWriteError('not_found', 'Entity not found.')
}

export async function deleteArchivedEntities(ids: string[]) {
  let uniqueIds: string[]
  try { uniqueIds = normalizeArchivedIds(ids) } catch { throw new EntityWriteError('invalid', 'ids must contain valid UUIDs.') }
  return db.transaction(async (tx) => {
    const found = await tx.select({ id: entities.id, archivedAt: entities.archivedAt, type: entities.type }).from(entities).where(inArray(entities.id, uniqueIds)).for('update')
    if (found.length !== uniqueIds.length || found.some((entity) => !entity.archivedAt || !isWikiType(entity.type))) {
      throw new EntityWriteError('conflict', 'All selected entities must exist and be archived.')
    }
    return tx.delete(entities).where(inArray(entities.id, uniqueIds)).returning({ id: entities.id })
  })
}
