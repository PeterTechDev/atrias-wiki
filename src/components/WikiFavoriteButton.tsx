'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { favoriteRequest } from '@/lib/wikiFavorites'

export function WikiFavoriteButton({ entityId }: { entityId: string }) {
  const { user, loading } = useAuth()
  if (loading || !user || user.is_anonymous) return null
  return <FavoriteButton key={`${user.id}:${entityId}`} userId={user.id} entityId={entityId} />
}

function FavoriteButton({ userId, entityId }: { userId: string; entityId: string }) {
  const [favorite, setFavorite] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void favoriteRequest(userId, `/${entityId}`).then(data => {
      if (active) setFavorite(data.favorite)
    }).catch(() => {
      if (active) setError('Não foi possível carregar o favorito.')
    })
    return () => { active = false }
  }, [userId, entityId, attempt])

  async function toggle() {
    setBusy(true)
    setError('')
    try {
      const data = await favoriteRequest(userId, `/${entityId}`, favorite ? 'DELETE' : 'PUT')
      setFavorite(data.favorite)
    } catch {
      setError('Não foi possível atualizar os favoritos. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  const label = favorite === null ? 'Carregando favorito' : favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
  return <div>
    <button type="button" aria-pressed={favorite ?? false} aria-busy={busy} aria-label={label} title={label} disabled={busy || favorite === null} onClick={toggle} className="wiki-button">
      <Star aria-hidden="true" className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
      <span>{favorite ? 'Favorito' : 'Favoritar'}</span>
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error} {favorite === null && <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1) }} className="underline">Tentar novamente</button>}</p>}
  </div>
}
