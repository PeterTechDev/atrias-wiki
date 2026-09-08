import { NextResponse } from 'next/server'
import { isWikiAdmin } from '@/lib/wikiAdmin'
import { isEntityId } from '@/lib/entityId'
import { setWikiDM } from '@/lib/wikiPermissions'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: Request) {
  if (!isWikiAdmin(req)) return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 })
  if (req.headers.get('origin') !== new URL(req.url).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body.userId !== 'string' || !isEntityId(body.userId) || typeof body.isDM !== 'boolean') {
    return NextResponse.json({ error: 'userId e isDM são obrigatórios.' }, { status: 400 })
  }
  try {
    if (body.isDM) {
      const { data, error } = await supabase.from('profiles').select('id').eq('id', body.userId).maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }
    await setWikiDM(body.userId, body.isDM)
    return NextResponse.json({ isDM: body.isDM })
  } catch {
    return NextResponse.json({ error: 'Não foi possível alterar a permissão.' }, { status: 500 })
  }
}
