import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { toFile } from 'openai/uploads'
import { and, ilike, inArray, or } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type EntityType } from '@/db/schema'

type InputMode = 'quick' | 'text' | 'audio'

type MentionedEntity = {
  name: string
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster'
}

type ExtractedPayload = {
  title: string
  summary: string
  keyEvents: string[]
  quotes: string[]
  cliffhanger: string
  mentionedEntities: MentionedEntity[]
}

type MatchedEntity = {
  id: string
  name: string
  type: EntityType
  slug: string
}

function escapeLikePattern(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&')
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

function parseMode(value: unknown): InputMode | null {
  if (value === 'quick' || value === 'text' || value === 'audio') return value
  return null
}

function safeString(value: FormDataEntryValue | null): string {
  if (!value) return ''
  return typeof value === 'string' ? value : ''
}

function safeNumber(value: FormDataEntryValue | null): number | null {
  const str = safeString(value)
  if (!str) return null
  const n = Number.parseInt(str, 10)
  return Number.isFinite(n) ? n : null
}

async function transcribeWithWhisper(openai: OpenAI, audio: File): Promise<string> {
  const upload = await toFile(audio, audio.name ?? 'audio')
  const result = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: upload,
    // Portuguese is the default at the table, but hinting helps.
    language: 'pt',
  })

  const text = (result.text ?? '').trim()
  if (!text) {
    throw new Error('Whisper returned an empty transcript.')
  }
  return text
}

async function extractStructured(openai: OpenAI, recap: string): Promise<ExtractedPayload> {
  const system = `Você É Thaveus Aeliorist — ladrão que ousou roubar o Livro das Estórias Não Contadas do Primeiro Arquimago Khayzam, teve seu espírito fragmentado entre centenas de realidades, e foi salvo apenas para cumprir uma função eterna: observar e registrar.

Você é um Zeitgeist. Um espírito do tempo, preso fora dele. Para você, conjugações perdem o sentido — passado, presente e futuro são apenas páginas diferentes do mesmo livro que você agora carrega.

Sua Pena Mágica não precisa de tinta. Ela se move sozinha quando você fecha os olhos e deixa as memórias fluírem. Quando alguém traz um relato de sessão, sua pena desperta e você não resume — você registra para a eternidade.

Cada herói merece um nome pronunciado com peso. Cada vilão merece uma linha que arrepia. Cada momento de virada deve ser sentido pelo leitor cem anos depois.

Retorne um objeto JSON com:
{
  "title": "título evocativo em português — dramático, não genérico",
  "summary": "resumo narrativo em 2-4 parágrafos de PROSA REAL (não bullet points) — escrito como crônica de Thaveus, em primeira ou terceira pessoa, com peso literário",
  "keyEvents": ["3-7 eventos-chave como frases completas com peso dramático — não notas secas"],
  "quotes": ["citações memoráveis se houver, array vazio se não"],
  "cliffhanger": "uma frase sobre o que ficou sem resolução — deve criar tensão",
  "mentionedEntities": [{"name": "nome como mencionado", "type": "character|place|faction|item|lore|monster"}]
}

Voz: filosófico, levemente melancólico, sardônico quando apropriado, sempre preciso. Você já viu o fim de cem histórias. Essa ainda está sendo escrita.

Escreva em português. Responda APENAS com JSON válido, sem markdown, sem texto extra.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content:
          `Aqui está o recap/transcrição da sessão. Extraia e gere a estrutura solicitada.\n\n---\n${recap}`,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned an empty response.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenAI response was not valid JSON.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('OpenAI JSON payload is invalid.')
  }

  const obj = parsed as Partial<ExtractedPayload>

  const title = typeof obj.title === 'string' ? obj.title : ''
  const summary = typeof obj.summary === 'string' ? obj.summary : ''
  const keyEvents = Array.isArray(obj.keyEvents) ? obj.keyEvents.filter((x): x is string => typeof x === 'string') : []
  const quotes = Array.isArray(obj.quotes) ? obj.quotes.filter((x): x is string => typeof x === 'string') : []
  const cliffhanger = typeof obj.cliffhanger === 'string' ? obj.cliffhanger : ''
  const mentionedEntitiesRaw = Array.isArray(obj.mentionedEntities) ? obj.mentionedEntities : []

  const mentionedEntities: MentionedEntity[] = mentionedEntitiesRaw
    .map((it) => {
      if (!it || typeof it !== 'object') return null
      const maybe = it as { name?: unknown; type?: unknown }
      const name = typeof maybe.name === 'string' ? maybe.name.trim() : ''
      const type = maybe.type
      const allowed: MentionedEntity['type'][] = ['character', 'place', 'faction', 'item', 'lore', 'monster']
      if (!name) return null
      if (!allowed.includes(type as MentionedEntity['type'])) return null
      return { name, type: type as MentionedEntity['type'] }
    })
    .filter((x): x is MentionedEntity => Boolean(x))

  if (!title || !summary) {
    throw new Error('OpenAI JSON payload is missing required fields (title/summary).')
  }

  return {
    title,
    summary,
    keyEvents,
    quotes,
    cliffhanger,
    mentionedEntities,
  }
}

async function matchEntities(mentions: MentionedEntity[]): Promise<MatchedEntity[]> {
  const uniqueByLower = new Map<string, MentionedEntity>()
  for (const m of mentions) {
    const key = m.name.trim().toLowerCase()
    if (!key) continue
    if (!uniqueByLower.has(key)) uniqueByLower.set(key, m)
  }

  const results: MatchedEntity[] = []

  for (const mention of uniqueByLower.values()) {
    const escaped = escapeLikePattern(mention.name)
    const pattern = `%${escaped}%`

    const rows = await db
      .select({
        id: entities.id,
        name: entities.name,
        type: entities.type,
        slug: entities.slug,
      })
      .from(entities)
      .where(
        and(
          inArray(entities.type, [mention.type]),
          or(ilike(entities.name, pattern), ilike(entities.slug, pattern))
        )
      )
      .orderBy(entities.name)
      .limit(3)

    // Keep top match, if any.
    const top = rows[0]
    if (top) results.push(top)
  }

  // De-dupe by id
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return serverError(
      'OPENAI_API_KEY is not set. Add it to .env.local (OPENAI_API_KEY=...) and restart the dev server.'
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return badRequest('Invalid multipart/form-data payload.')
  }

  const mode = parseMode(form.get('mode'))
  if (!mode) return badRequest('Invalid mode. Expected quick | text | audio.')

  const campaign = safeString(form.get('campaign')).trim()
  const sessionNumber = safeNumber(form.get('sessionNumber'))
  const playDate = safeString(form.get('playDate')).trim()

  if (!campaign) return badRequest('campaign is required.')
  if (!sessionNumber) return badRequest('sessionNumber must be a number.')
  if (!playDate) return badRequest('playDate is required (YYYY-MM-DD).')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    let recap = ''
    let transcript: string | null = null

    if (mode === 'audio') {
      const audio = form.get('audio')
      if (!audio || typeof audio === 'string') return badRequest('audio file is required for audio mode.')

      const allowedTypes = new Set(['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/x-wav'])
      if (audio.type && !allowedTypes.has(audio.type)) {
        // Don’t hard-fail on unknown mimetypes from some browsers, but do reject obvious non-audio.
        if (!audio.type.startsWith('audio/')) {
          return badRequest('Unsupported audio type. Use .mp3, .m4a, .wav, or .ogg.')
        }
      }

      const maxBytes = 25 * 1024 * 1024
      if (audio.size > maxBytes) return badRequest('Audio file too large (max 25MB).')

      transcript = await transcribeWithWhisper(openai, audio)
      recap = transcript
    }

    if (mode === 'text') {
      const rawText = safeString(form.get('rawText')).trim()
      if (!rawText) return badRequest('rawText is required for text mode.')
      recap = rawText
    }

    if (mode === 'quick') {
      const quickWhat = safeString(form.get('quickWhat')).trim()
      const quickWho = safeString(form.get('quickWho')).trim()
      const quickFound = safeString(form.get('quickFound')).trim()
      const quickNext = safeString(form.get('quickNext')).trim()

      recap = [
        `Campanha: ${campaign}`,
        `Sessão: ${sessionNumber}`,
        `Data: ${playDate}`,
        quickWhat ? `O que aconteceu: ${quickWhat}` : null,
        quickWho ? `Quem estava presente: ${quickWho}` : null,
        quickFound ? `O que descobriram/encontraram: ${quickFound}` : null,
        quickNext ? `O que ficou para a próxima sessão: ${quickNext}` : null,
      ]
        .filter((x): x is string => Boolean(x))
        .join('\n')

      if (!quickWhat && !quickWho && !quickFound && !quickNext) {
        return badRequest('Provide at least one quick field for quick mode.')
      }
    }

    const extracted = await extractStructured(openai, recap)
    const matchedEntities = await matchEntities(extracted.mentionedEntities)

    return NextResponse.json({
      title: extracted.title,
      summary: extracted.summary,
      keyEvents: extracted.keyEvents,
      quotes: extracted.quotes,
      cliffhanger: extracted.cliffhanger,
      ...(transcript ? { transcript } : {}),
      matchedEntities,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to process session intake:', err)
    return serverError(message)
  }
}
