import type { Session } from '@supabase/supabase-js'

let pending: Promise<unknown> = Promise.resolve()

const sessionSyncError = 'Não foi possível sincronizar a sessão. Recarregue a página.'

export function syncWikiSession(session: Pick<Session, 'access_token'> | null, timeoutMs = 8000) {
  // A late login response must never overwrite the cookie after logout.
  const next = pending.catch(() => undefined).then(async () => {
    try {
      const response = await fetch('/api/wiki/session', {
        method: 'PUT',
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) throw new Error(sessionSyncError)
      if (session && !(await response.json()).authenticated) throw new Error('Sua sessão expirou. Entre novamente.')
    } catch (error) {
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) throw new Error(sessionSyncError)
      throw error
    }
  })
  pending = next
  return next
}
