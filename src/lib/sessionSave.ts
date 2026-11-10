import { NextResponse } from 'next/server'
import type { EntityType } from '../db/schema'

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

export type SessionSaveRecord = SavePayload & { slug: string }

type SessionSaveDeps = {
  getMember: (req: Request) => Promise<{ id: string } | null>
  persist: (record: SessionSaveRecord) => Promise<{ id: string; slug: string }>
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function sessionSaveHeaders(accessToken: string | null | undefined): { headers: Record<string, string> } | { error: string } {
  const token = accessToken?.trim()
  if (!token) return { error: 'Sua sessão expirou. Entre novamente e tente salvar.' }
  return {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  }
}

export async function handleSessionSave(req: Request, deps: SessionSaveDeps) {
  const user = await deps.getMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

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
  if (sessionNumber === null) return badRequest('sessionNumber is required.')
  if (!Number.isInteger(sessionNumber)) return badRequest('sessionNumber must be an integer.')
  if (sessionNumber < 1 || sessionNumber > 999) return badRequest('sessionNumber must be between 1 and 999.')

  const playDateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!playDate) return badRequest('playDate is required.')
  if (!playDateRe.test(playDate)) return badRequest('playDate must match YYYY-MM-DD.')

  if (!title) return badRequest('title is required.')
  if (!summary) return badRequest('summary is required.')

  const sanitizedCampaign = campaign
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

  if (!sanitizedCampaign) return badRequest('campaign must contain at least one alphanumeric character.')

  const cleanedCampaign = sanitizedCampaign.replace(/^campanha-/, '')
  const slug = `campanha-${cleanedCampaign}-${sessionNumber}`

  const uuidV4Re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const validMatchedEntities = matchedEntities.filter((m) => uuidV4Re.test(m.id))

  try {
    const saved = await deps.persist({
      campaign,
      sessionNumber,
      playDate,
      title,
      summary,
      keyEvents,
      quotes,
      cliffhanger,
      transcript,
      matchedEntities: validMatchedEntities,
      slug,
    })
    return NextResponse.json({ id: saved.id, slug: saved.slug })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'Failed to create session entity.') {
      return NextResponse.json({ error: 'Failed to create session entity.' }, { status: 500 })
    }
    const details =
      process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined

    return NextResponse.json({ error: 'Failed to save session', details }, { status: 500 })
  }
}
