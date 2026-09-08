import { NextResponse } from 'next/server'
import { listFavorites } from '@/db/queries/favorites'
import { getWikiMember } from '@/lib/wikiAuth'

export async function GET(req: Request) {
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  return NextResponse.json({ favorites: await listFavorites(user.id) })
}
