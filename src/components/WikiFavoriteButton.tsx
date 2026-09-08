'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export function WikiFavoriteButton({ entityId }: { entityId: string }) {
  const { user, loading } = useAuth()
  const [favorite, setFavorite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { setFavorite(false); return }
    let active = true
    void (async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await fetch(`/api/wiki/favorites/${entityId}`, { headers: { Authorization: `Bearer ${token ?? ''}` }, cache: 'no-store' })
      if (active && response.ok) setFavorite((await response.json()).favorite)
    })()
    return () => { active = false }
  }, [user, entityId])

  if (loading || !user) return null
  async function toggle() {
    setBusy(true); setError('')
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const response = await fetch(`/api/wiki/favorites/${entityId}`, { method: favorite ? 'DELETE' : 'PUT', headers: { Authorization: `Bearer ${token ?? ''}` } })
      if (!response.ok) throw new Error()
      setFavorite(!favorite)
    } catch { setError('Não foi possível atualizar os favoritos. Tente novamente.') } finally { setBusy(false) }
  }
  return <div><button type="button" aria-pressed={favorite} aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} disabled={busy} onClick={toggle} className="rounded border border-amber-700 px-3 py-2 text-amber-700 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-500 disabled:opacity-50"><Star className="h-5 w-5" fill={favorite ? 'currentColor' : 'none'} /></button>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>
}
