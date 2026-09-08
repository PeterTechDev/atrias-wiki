import type { Session } from '@supabase/supabase-js'

let pending: Promise<unknown> = Promise.resolve()

export function syncWikiSession(session: Pick<Session, 'access_token'> | null) {
  // A late login response must never overwrite the cookie after logout.
  const next = pending.catch(() => undefined).then(async () => {
    const response = await fetch('/api/wiki/session', { method: 'PUT', headers: session ? { Authorization: `Bearer ${session.access_token}` } : {} })
    if (!response.ok) throw new Error('Não foi possível sincronizar a sessão. Recarregue a página.')
    if (session && !(await response.json()).authenticated) throw new Error('Sua sessão expirou. Entre novamente.')
  })
  pending = next
  return next
}
