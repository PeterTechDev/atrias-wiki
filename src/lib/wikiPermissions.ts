import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { entities, wikiDMs } from '@/db/schema'

// Read from the database, never from user-editable metadata or stale JWT roles.
export async function isWikiDM(userId?: string) {
  if (!userId) return false
  const [dm] = await db.select({ userId: wikiDMs.userId }).from(wikiDMs).where(eq(wikiDMs.userId, userId)).limit(1)
  return Boolean(dm)
}

export function entityVisibility(isDM = false) {
  return isDM ? sql`true` : sql`${entities.isSpoiler} is not true`
}

export async function setWikiDM(userId: string, enabled: boolean) {
  if (enabled) await db.insert(wikiDMs).values({ userId }).onConflictDoNothing()
  else await db.delete(wikiDMs).where(eq(wikiDMs.userId, userId))
}

export function dmPermission(userId?: string) {
  return sql`exists (${db.select({ userId: wikiDMs.userId }).from(wikiDMs).where(eq(wikiDMs.userId, userId ?? '00000000-0000-0000-0000-000000000000'))})`
}

export function writerVisibility(userId?: string) {
  return sql`(${entities.isSpoiler} is not true or ${dmPermission(userId)})`
}
