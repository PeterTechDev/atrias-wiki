import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { entities, entityFavorites } from '@/db/schema'
import { isEntityId } from '@/lib/entityId'

export const favoritableEntityTypes = ['character', 'place', 'faction', 'item', 'lore', 'monster'] as const

export function isFavoriteEntityId(id: string) {
  return isEntityId(id)
}

export async function isFavorite(userId: string, entityId: string) {
  const [favorite] = await db.select({ entityId: entityFavorites.entityId }).from(entityFavorites).where(and(eq(entityFavorites.userId, userId), eq(entityFavorites.entityId, entityId))).limit(1)
  return Boolean(favorite)
}

export async function addFavorite(userId: string, entityId: string) {
  const [entity] = await db.select({ id: entities.id }).from(entities).where(and(eq(entities.id, entityId), inArray(entities.type, favoritableEntityTypes))).limit(1)
  if (!entity) return false
  await db.insert(entityFavorites).values({ userId, entityId }).onConflictDoNothing()
  return true
}

export async function removeFavorite(userId: string, entityId: string) {
  await db.delete(entityFavorites).where(and(eq(entityFavorites.userId, userId), eq(entityFavorites.entityId, entityId)))
}

export async function listFavorites(userId: string) {
  return db.select({ id: entities.id, slug: entities.slug, name: entities.name, type: entities.type, description: entities.description, archivedAt: entities.archivedAt, createdAt: entityFavorites.createdAt })
    .from(entityFavorites).innerJoin(entities, eq(entityFavorites.entityId, entities.id))
    .where(eq(entityFavorites.userId, userId)).orderBy(desc(entityFavorites.createdAt))
}
