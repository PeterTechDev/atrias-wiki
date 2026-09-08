import { NextResponse } from 'next/server'
import { addFavorite, isFavorite, isFavoriteEntityId, removeFavorite } from '@/db/queries/favorites'
import { getWikiMember } from '@/lib/wikiAuth'
import { isWikiDM } from '@/lib/wikiPermissions'

async function memberAndId(req: Request, params: Promise<{ id: string }>) {
  const user = await getWikiMember(req)
  const { id } = await params
  if (!user) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  if (!isFavoriteEntityId(id)) return { error: NextResponse.json({ error: 'Invalid entity id.' }, { status: 400 }) }
  return { user, id }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await memberAndId(req, params)
  if ('error' in result) return result.error
  return NextResponse.json({ favorite: await isFavorite(result.user.id, result.id, await isWikiDM(result.user.id)) })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await memberAndId(req, params)
  if ('error' in result) return result.error
  if (!await addFavorite(result.user.id, result.id, await isWikiDM(result.user.id))) return NextResponse.json({ error: 'Entity not found.' }, { status: 404 })
  return NextResponse.json({ favorite: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await memberAndId(req, params)
  if ('error' in result) return result.error
  await removeFavorite(result.user.id, result.id)
  return NextResponse.json({ favorite: false })
}
