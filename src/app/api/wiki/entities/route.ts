import { NextResponse } from 'next/server'
import { createEntity, EntityWriteError, type WikiEntityType } from '@/db/queries/entities'
import { getWikiMember, wikiEditingDisabled } from '@/lib/wikiAuth'

function errorResponse(error: unknown) {
  if (error instanceof EntityWriteError) {
    const status = error.code === 'invalid' ? 400 : error.code === 'not_found' ? 404 : 409
    return NextResponse.json({ error: error.message }, { status })
  }
  console.error('POST /api/wiki/entities failed:', error)
  return NextResponse.json({ error: 'Failed to create entity.' }, { status: 500 })
}

export async function POST(req: Request) {
  if (wikiEditingDisabled()) return NextResponse.json({ error: 'Edição temporariamente indisponível.' }, { status: 503 })

  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  try {
    let body: { type?: WikiEntityType; name?: string; slug?: string; description?: string; data?: Record<string, unknown> }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }
    if (typeof body.type !== 'string' || typeof body.name !== 'string' || typeof body.slug !== 'string') {
      return NextResponse.json({ error: 'type, name, and slug are required.' }, { status: 400 })
    }
    const entity = await createEntity({
      type: body.type,
      name: body.name,
      slug: body.slug,
      description: body.description,
      data: body.data,
    }, { source: 'member', userId: user.id })
    return NextResponse.json({ id: entity.id, slug: entity.slug }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
