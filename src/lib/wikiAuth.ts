import { isAuthRetryableFetchError } from '@supabase/auth-js'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type WikiMemberLookup =
  | { state: 'member'; user: User }
  | { state: 'absent' }
  | { state: 'unavailable' }

export async function classifyWikiMember(req: Request): Promise<WikiMemberLookup> {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return { state: 'absent' }
  const token = header.slice('Bearer '.length).trim()
  if (!token) return { state: 'absent' }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (isAuthRetryableFetchError(error)) return { state: 'unavailable' }
    if (error || !data.user || data.user.is_anonymous) return { state: 'absent' }
    return { state: 'member', user: data.user }
  } catch (error) {
    if (isAuthRetryableFetchError(error)) return { state: 'unavailable' }
    throw error
  }
}

export async function getWikiMember(req: Request) {
  const lookup = await classifyWikiMember(req)
  return lookup.state === 'member' ? lookup.user : null
}

export function wikiEditingDisabled() {
  return process.env.WIKI_EDITING_ENABLED === 'false'
}
