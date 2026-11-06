import { db } from '@/db'
import { entities, entityRelations } from '@/db/schema'
import { handleSessionSave, type SessionSaveRecord } from '@/lib/sessionSave'
import { getWikiMember } from '@/lib/wikiAuth'

async function persistSession(record: SessionSaveRecord) {
  const inserted = await db
    .insert(entities)
    .values({
      type: 'session',
      slug: record.slug,
      name: record.title,
      description: record.summary,
      data: {
        keyEvents: record.keyEvents,
        quotes: record.quotes,
        cliffhanger: record.cliffhanger,
        transcript: record.transcript,
        playDate: record.playDate,
        sessionNumber: record.sessionNumber,
        campaign: record.campaign,
      },
    })
    .returning({ id: entities.id, slug: entities.slug })

  const newSession = inserted[0]
  if (!newSession) throw new Error('Failed to create session entity.')

  if (record.matchedEntities.length > 0) {
    await db.insert(entityRelations).values(
      record.matchedEntities.map((m) => ({
        sourceId: newSession.id,
        targetId: m.id,
        relationType: 'mentioned_in',
        confidence: 0.9,
        metadata: {},
      }))
    )
  }

  return { id: newSession.id, slug: newSession.slug }
}

export async function POST(req: Request) {
  return handleSessionSave(req, { getMember: getWikiMember, persist: persistSession })
}
