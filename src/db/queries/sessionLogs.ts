import { and, eq, inArray, asc, count } from 'drizzle-orm'
import { db } from '@/db'
import { campaigns, sessionLogs, type Campaign, type SessionLog, type SessionLogStatus } from '@/db/schema'

const visibleStatuses: SessionLogStatus[] = ['approved', 'published']

export async function getCampaignsWithCounts(): Promise<(Campaign & { sessionCount: number })[]> {
  try {
    const rows = await db
      .select({
        id: campaigns.id,
        slug: campaigns.slug,
        name: campaigns.name,
        description: campaigns.description,
        image: campaigns.image,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        sessionCount: count(sessionLogs.id),
      })
      .from(campaigns)
      .leftJoin(sessionLogs, and(eq(sessionLogs.campaignId, campaigns.id), inArray(sessionLogs.status, visibleStatuses)))
      .groupBy(campaigns.id)
      .orderBy(asc(campaigns.name))

    return rows
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    throw new Error('Unable to load campaigns. Please try again later.')
  }
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const result = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1)
    return result[0] ?? null
  } catch (error) {
    console.error(`Failed to fetch campaign with slug "${slug}":`, error)
    throw new Error('Unable to load campaign. Please try again later.')
  }
}

export async function getVisibleSessionLogsForCampaign(campaignId: string): Promise<SessionLog[]> {
  try {
    return await db
      .select()
      .from(sessionLogs)
      .where(and(eq(sessionLogs.campaignId, campaignId), inArray(sessionLogs.status, visibleStatuses)))
      .orderBy(asc(sessionLogs.chapterNumber))
  } catch (error) {
    console.error(`Failed to fetch session logs for campaignId "${campaignId}":`, error)
    throw new Error('Unable to load chapters. Please try again later.')
  }
}

export async function getVisibleSessionLogByCampaignAndChapter(
  campaignId: string,
  chapterNumber: number
): Promise<SessionLog | null> {
  try {
    const result = await db
      .select()
      .from(sessionLogs)
      .where(
        and(
          eq(sessionLogs.campaignId, campaignId),
          eq(sessionLogs.chapterNumber, chapterNumber),
          inArray(sessionLogs.status, visibleStatuses)
        )
      )
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error(`Failed to fetch session log for campaignId "${campaignId}" chapter ${chapterNumber}:`, error)
    throw new Error('Unable to load session log. Please try again later.')
  }
}

export async function getPrevNextChapterNumbers(
  campaignId: string,
  chapterNumber: number
): Promise<{ prev: number | null; next: number | null }> {
  try {
    const rows = await db
      .select({ chapterNumber: sessionLogs.chapterNumber })
      .from(sessionLogs)
      .where(and(eq(sessionLogs.campaignId, campaignId), inArray(sessionLogs.status, visibleStatuses)))
      .orderBy(asc(sessionLogs.chapterNumber))

    const chapterNumbers = rows.map((r) => r.chapterNumber)
    const idx = chapterNumbers.indexOf(chapterNumber)

    return {
      prev: idx > 0 ? chapterNumbers[idx - 1] : null,
      next: idx >= 0 && idx < chapterNumbers.length - 1 ? chapterNumbers[idx + 1] : null,
    }
  } catch (error) {
    console.error('Failed to fetch prev/next chapter numbers:', error)
    throw new Error('Unable to load navigation. Please try again later.')
  }
}
