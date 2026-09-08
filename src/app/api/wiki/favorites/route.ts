import { NextResponse } from 'next/server'
import { listFavorites } from '@/db/queries/favorites'
import { getWikiMember } from '@/lib/wikiAuth'
import { isWikiDM } from '@/lib/wikiPermissions'

export async function GET(req: Request) {
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ favorites: await listFavorites(user.id, await isWikiDM(user.id)) })
}
