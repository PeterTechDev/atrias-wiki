import { ilike, or, and, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type EntityType } from '@/db/schema'
import type { SearchResult } from '@/types/entities'

// Escape SQL LIKE special characters to prevent unexpected behavior
function escapeLikePattern(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&')
}

export async function searchEntities(
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const escapedQuery = escapeLikePattern(query)
    const searchPattern = `%${escapedQuery}%`

    const results = await db
      .select({
        id: entities.id,
        type: entities.type,
        slug: entities.slug,
        name: entities.name,
        description: entities.description,
      })
      .from(entities)
      .where(
        or(
          ilike(entities.name, searchPattern),
          ilike(entities.description, searchPattern)
        )
      )
      .orderBy(entities.name)
      .limit(limit)

    return results
  } catch (error) {
    console.error(`Search failed for query "${query}":`, error)
    throw new Error('Search temporarily unavailable. Please try again.')
  }
}

export async function searchEntitiesByType(
  query: string,
  types: EntityType[],
  limit = 20
): Promise<SearchResult[]> {
  if (!query || query.length < 2 || types.length === 0) {
    return []
  }

  try {
    const escapedQuery = escapeLikePattern(query)
    const searchPattern = `%${escapedQuery}%`

    const results = await db
      .select({
        id: entities.id,
        type: entities.type,
        slug: entities.slug,
        name: entities.name,
        description: entities.description,
      })
      .from(entities)
      .where(
        and(
          inArray(entities.type, types),
          or(
            ilike(entities.name, searchPattern),
            ilike(entities.description, searchPattern)
          )
        )
      )
      .orderBy(entities.name)
      .limit(limit)

    return results
  } catch (error) {
    console.error(`Search failed for query "${query}" with types ${types.join(', ')}:`, error)
    throw new Error('Search temporarily unavailable. Please try again.')
  }
}
