import { NextResponse } from 'next/server'
import { getEntitiesByType } from '@/db/queries/entities'
import { getWikiMember } from '@/lib/wikiAuth'
import { isWikiDM } from '@/lib/wikiPermissions'

export async function GET(req: Request) {
  const user = await getWikiMember(req)
  if (!user) return NextResponse.json({ error: 'Entre para procurar personagens.' }, { status: 401 })
  try {
    const characters = await getEntitiesByType('character', await isWikiDM(user.id))
    return NextResponse.json(characters.map(({ name, slug }) => ({ name, slug })), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return NextResponse.json({ error: 'Não foi possível carregar os personagens. Tente novamente.' }, { status: 503 }) }
}
