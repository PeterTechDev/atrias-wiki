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
  return <div className="group">
    <button type="button" aria-pressed={favorite ?? false} aria-busy={busy} aria-label={label} title={label} disabled={busy || favorite === null} onClick={toggle} className="flex h-10 w-[100px] items-center justify-center overflow-hidden rounded-full border border-[#c6a862]/40 bg-[#0a1628] transition-transform duration-300 group-hover:border-[#c6a862] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6a862] active:scale-95 motion-reduce:transition-none disabled:cursor-wait disabled:opacity-50">
      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#c6a862] to-[#a8935a] transition-[width] duration-300 group-hover:w-[90px] motion-reduce:transition-none">
        <Star aria-hidden="true" className="h-4 w-4 text-[#0a1628]" fill={favorite ? 'currentColor' : 'none'} />
      </span>
      <span className="flex h-full w-[60px] shrink-0 items-center justify-center text-xs font-semibold text-[#e8dcc8] transition-[width,transform,font-size] duration-300 group-hover:w-0 group-hover:translate-x-[10px] group-hover:text-[0px] motion-reduce:transition-none">
        {favorite ? 'Favorito' : 'Favoritar'}
      </span>
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error} {favorite === null && <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1) }} className="underline">Tentar novamente</button>}</p>}
  </div>
}
