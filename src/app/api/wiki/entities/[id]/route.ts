import { NextResponse } from 'next/server'
import { EntityWriteError, updateEntity } from '@/db/queries/entities'
import { getWikiMember, wikiEditingDisabled } from '@/lib/wikiAuth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (wikiEditingDisabled()) return NextResponse.json({ error: 'Edição temporariamente indisponível.' }, { status: 503 })

  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const { id } = await params
  try {
    let body: { name?: string; description?: string; data?: Record<string, unknown>; revision?: number }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
    }
    if (typeof body.name !== 'string' || typeof body.description !== 'string' || !Number.isInteger(body.revision)) {
      return NextResponse.json({ error: 'name, description, data, and revision are required.' }, { status: 400 })
    }
    const entity = await updateEntity({
      id,
      name: body.name,
      description: body.description,
      data: body.data,
      expectedRevision: body.revision,
    }, { source: 'member', userId: user.id })
    return NextResponse.json({ id: entity.id, slug: entity.slug, revision: entity.revision })
  } catch (error) {
    if (error instanceof EntityWriteError) {
      const status = error.code === 'invalid' ? 400 : error.code === 'not_found' ? 404 : 409
      return NextResponse.json({ error: error.message }, { status })
    }
    console.error(`PATCH /api/wiki/entities/${id} failed:`, error)
    return NextResponse.json({ error: 'Failed to update entity.' }, { status: 500 })
  }
}
