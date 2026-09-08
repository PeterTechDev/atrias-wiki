import { supabase } from '@/lib/supabase'

export async function getWikiMember(req: Request) {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null

  const token = header.slice('Bearer '.length).trim()
  if (!token) return null

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user || data.user.is_anonymous) return null
  return data.user
}

export function wikiEditingDisabled() {
  return process.env.WIKI_EDITING_ENABLED === 'false'
}
