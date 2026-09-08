import { supabase } from '@/lib/supabase'

export async function favoriteRequest(userId: string, path = '', method = 'GET') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session || session.user.id !== userId || session.user.is_anonymous) throw new Error('Account changed')
  const response = await fetch(`/api/wiki/favorites${path}`, {
    method, cache: 'no-store', headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!response.ok) throw new Error('Favorites request failed')
  return response.json()
}
