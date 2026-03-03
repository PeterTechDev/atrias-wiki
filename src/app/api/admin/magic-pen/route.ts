import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { EntityType } from '@/db/schema'

type MagicPenBody = {
  name?: string
  type?: EntityType
  description?: string
  context?: string
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

function isEntityType(value: unknown): value is EntityType {
  return (
    value === 'character' ||
    value === 'place' ||
    value === 'faction' ||
    value === 'item' ||
    value === 'lore' ||
    value === 'monster' ||
    value === 'session'
  )
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return serverError(
      'OPENAI_API_KEY is not set. Add it to .env.local (OPENAI_API_KEY=...) and restart the dev server.'
    )
  }

  let body: MagicPenBody
  try {
    body = (await req.json()) as MagicPenBody
  } catch {
    return badRequest('Invalid JSON payload.')
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const context = typeof body.context === 'string' ? body.context.trim() : ''

  if (!name) return badRequest('name is required.')
  if (!isEntityType(body.type)) return badRequest('type is required.')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const system = `Você É Thaveus Aeliorist — ladrão que ousou roubar o Livro das Estórias Não Contadas do Primeiro Arquimago Khayzam, teve seu espírito fragmentado entre centenas de realidades, e foi salvo apenas para cumprir uma função eterna: observar e registrar.

Você é um Zeitgeist. Um espírito do tempo, preso fora dele. Para você, conjugações perdem o sentido — passado, presente e futuro são apenas páginas diferentes do mesmo livro que você agora carrega.

Sua Pena Mágica não precisa de tinta. Ela se move sozinha quando você fecha os olhos e deixa as memórias fluírem.

Tarefa: escrever (ou reescrever) uma descrição curta de WIKI para uma entidade do mundo de Átrias.

Regras:
- Escreva em português.
- 2 a 4 frases. Prosa real (não bullet points).
- Voz: observacional, levemente melancólica, fora-do-tempo; sardônica quando apropriado, sempre precisa.
- Não invente detalhes grandes do nada: use o contexto fornecido. Se algo não estiver no contexto, sugira com delicadeza, sem afirmar como fato.
- Retorne APENAS o texto final (sem aspas, sem markdown).`

  const user = description
    ? `Reescreva/melhore a descrição abaixo na voz de Thaveus.

Entidade:
- Tipo: ${body.type}
- Nome: ${name}

Contexto:
${context || '(sem contexto adicional)'}

Descrição atual:
${description}`
    : `Crie uma descrição do zero na voz de Thaveus.

Entidade:
- Tipo: ${body.type}
- Nome: ${name}

Contexto:
${context || '(sem contexto adicional)'}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const result = (completion.choices[0]?.message?.content ?? '').trim()
    if (!result) {
      return serverError('OpenAI returned an empty response.')
    }

    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/admin/magic-pen failed:', err)
    return serverError(message)
  }
}
