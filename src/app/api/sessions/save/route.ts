import { NextResponse } from 'next/server'
import { db } from '@/db'
import { entities, entityRelations, type EntityType } from '@/db/schema'

type MatchedEntity = {
  id: string
  name: string
  type: EntityType
  slug: string
}

type SavePayload = {
  campaign: string
  sessionNumber: number
  playDate: string
  title: string
  summary: string
  keyEvents: string[]
  quotes: string[]
  cliffhanger: string
  transcript?: string
  matchedEntities: MatchedEntity[]
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON payload.')
  }

  if (!body || typeof body !== 'object') return badRequest('Invalid JSON payload.')
  const b = body as Partial<SavePayload>

  const campaign = typeof b.campaign === 'string' ? b.campaign.trim() : ''
  const sessionNumber = typeof b.sessionNumber === 'number' && Number.isFinite(b.sessionNumber) ? b.sessionNumber : null
  const playDate = typeof b.playDate === 'string' ? b.playDate.trim() : ''

  const title = typeof b.title === 'string' ? b.title.trim() : ''
  const summary = typeof b.summary === 'string' ? b.summary.trim() : ''

  const keyEvents = Array.isArray(b.keyEvents) ? b.keyEvents.filter((x): x is string => typeof x === 'string') : []
  const quotes = Array.isArray(b.quotes) ? b.quotes.filter((x): x is string => typeof x === 'string') : []
  const cliffhanger = typeof b.cliffhanger === 'string' ? b.cliffhanger.trim() : ''

  const transcript = typeof b.transcript === 'string' ? b.transcript : undefined

  const matchedEntities = Array.isArray(b.matchedEntities)
    ? b.matchedEntities.filter((m): m is MatchedEntity => {
        if (!m || typeof m !== 'object') return false
        const mm = m as Partial<MatchedEntity>
        return Boolean(
          typeof mm.id === 'string' &&
            typeof mm.name === 'string' &&
            typeof mm.slug === 'string' &&
            typeof mm.type === 'string'
        )
      })
    : []

  if (!campaign) return badRequest('campaign is required.')
  if (!sessionNumber) return badRequest('sessionNumber is required.')
  if (!playDate) return badRequest('playDate is required.')
  if (!title) return badRequest('title is required.')
  if (!summary) return badRequest('summary is required.')

  const slug = `campanha-${campaign}-${sessionNumber}`

  const inserted = await db
    .insert(entities)
    .values({
      type: 'session',
      slug,
      name: title,
      description: summary,
      data: {
        keyEvents,
        quotes,
        cliffhanger,
        transcript,
        playDate,
        sessionNumber,
        campaign,
      },
    })
    .returning({ id: entities.id, slug: entities.slug })

  const newSession = inserted[0]
  if (!newSession) {
    return NextResponse.json({ error: 'Failed to create session entity.' }, { status: 500 })
  }

  if (matchedEntities.length > 0) {
    await db.insert(entityRelations).values(
      matchedEntities.map((m) => ({
        sourceId: newSession.id,
        targetId: m.id,
        relationType: 'mentioned_in',
        confidence: 0.9,
        metadata: {},
      }))
    )
  }

  return NextResponse.json({ id: newSession.id, slug: newSession.slug })
}
