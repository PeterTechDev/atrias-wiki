import { NextResponse } from 'next/server'
import { archiveEntity, EntityWriteError } from '@/db/queries/entities'
import { getWikiMember, wikiEditingDisabled } from '@/lib/wikiAuth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (wikiEditingDisabled()) return NextResponse.json({ error: 'Edição temporariamente indisponível.' }, { status: 503 })
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const entity = await archiveEntity((await params).id, user.id)
    return NextResponse.json({ id: entity.id, archivedAt: entity.archivedAt })
  } catch (error) {
    if (error instanceof EntityWriteError) return NextResponse.json({ error: error.message }, { status: error.code === 'invalid' ? 400 : 404 })
    console.error('POST /api/wiki/entities/[id]/archive failed:', error)
    return NextResponse.json({ error: 'Failed to archive entity.' }, { status: 500 })
  }
}
