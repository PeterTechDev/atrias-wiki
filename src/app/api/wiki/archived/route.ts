import { NextResponse } from 'next/server'
import { deleteArchivedEntities, EntityWriteError, getArchivedEntities } from '@/db/queries/entities'
import { getWikiMember, wikiEditingDisabled } from '@/lib/wikiAuth'
import { isWikiDM } from '@/lib/wikiPermissions'

export async function GET(req: Request) {
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ entities: await getArchivedEntities(await isWikiDM(user.id)) })
}

export async function DELETE(req: Request) {
  if (wikiEditingDisabled()) return NextResponse.json({ error: 'Edição temporariamente indisponível.' }, { status: 503 })
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await req.json()
    if (!Array.isArray(body?.ids) || body.ids.some((id: unknown) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'ids must be an array.' }, { status: 400 })
    }
    const deleted = await deleteArchivedEntities(body.ids, user.id)
    return NextResponse.json({ deleted: deleted.map(({ id }) => id) })
  } catch (error) {
    if (error instanceof EntityWriteError) return NextResponse.json({ error: error.message }, { status: error.code === 'invalid' ? 400 : 409 })
    console.error('DELETE /api/wiki/archived failed:', error)
    return NextResponse.json({ error: 'Failed to delete archived entities.' }, { status: 500 })
  }
}
