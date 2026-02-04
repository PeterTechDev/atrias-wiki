import { eq, and, count } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type Entity, type EntityType } from '@/db/schema'
import type { EntityCounts } from '@/types/entities'

export async function getEntityBySlug(
  type: EntityType,
  slug: string
): Promise<Entity | null> {
  try {
    const result = await db
      .select()
      .from(entities)
      .where(and(eq(entities.type, type), eq(entities.slug, slug)))
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
      .where(eq(entities.type, type))
      .orderBy(entities.name)
  } catch (error) {
    console.error(`Failed to fetch entities of type "${type}":`, error)
    throw new Error(`Unable to load ${type} list. Please try again later.`)
  }
}

export async function getAllEntities(): Promise<Entity[]> {
  try {
    return await db.select().from(entities).orderBy(entities.name)
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
      .where(eq(entities.id, id))
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
      sessions: countMap['session'] ?? 0,
      total,
    }
  } catch (error) {
    console.error('Failed to fetch entity counts:', error)
    throw new Error('Unable to load statistics. Please try again later.')
  }
}
