import { isAuthError, isAuthRetryableFetchError } from '@supabase/auth-js'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// GoTrue marks transport and 5xx failures as AuthRetryableFetchError so they do not
// invalidate a session. 408 and 429 stay AuthApiError; their status is the HTTP retry
// signal, and the SDK names the same failures with timeout or rate_limit codes.
function isTransientAuthFailure(error: unknown) {
  if (isAuthRetryableFetchError(error)) return true
  if (!isAuthError(error)) return false
  if (error.status === 408 || error.status === 429) return true
  const code = error.code ?? ''
  return code.endsWith('_rate_limit') || code.endsWith('_timeout') || code.includes('_timeout_')
}

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
    if (isTransientAuthFailure(error)) return { state: 'unavailable' }
    if (error || !data.user || data.user.is_anonymous) return { state: 'absent' }
    return { state: 'member', user: data.user }
  } catch (error) {
    if (isTransientAuthFailure(error)) return { state: 'unavailable' }
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
