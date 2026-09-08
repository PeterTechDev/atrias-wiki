'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { favoriteRequest } from '@/lib/wikiFavorites'

type Favorite = { id: string; slug: string; name: string; type: string; description: string | null; archivedAt: string | null }
const paths: Record<string, string> = { character: 'characters', place: 'places', faction: 'factions', item: 'items', lore: 'lore', monster: 'monsters' }
const labels: Record<string, string> = { character: 'Personagem', place: 'Lugar', faction: 'Facção', item: 'Item', lore: 'Lore', monster: 'Monstro' }

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  if (loading) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100">Carregando conta…</main>
  if (!user || user.is_anonymous) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><Link href="/login?next=/wiki/favorites" className="text-amber-400">Entre para ver seus favoritos.</Link></main>
  return <Favorites key={user.id} userId={user.id} />
}

function Favorites({ userId }: { userId: string }) {
  const [items, setItems] = useState<Favorite[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void favoriteRequest(userId).then(data => {
      if (active) setItems(data.favorites)
    }).catch(() => {
      if (active) setError('Não foi possível carregar os favoritos.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId, attempt])

  async function remove(id: string) {
    setBusy(true)
    setError('')
    try {
      await favoriteRequest(userId, `/${id}`, 'DELETE')
      setItems(current => current.filter(item => item.id !== id))
    } catch {
      setError('Não foi possível remover o favorito. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><div className="mx-auto max-w-3xl">
    <Link href="/" className="text-amber-400">← Voltar</Link>
    <h1 className="mt-4 text-3xl font-bold text-amber-400">Favoritos</h1>
    {error && <p role="alert" className="mt-4 text-red-300">{error} <button type="button" disabled={busy || loading} onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1) }} className="underline">Tentar novamente</button></p>}
    {loading && <p role="status" className="mt-6">Carregando…</p>}
    {!loading && !items.length && !error && <p className="mt-8 text-zinc-400">Você ainda não adicionou páginas aos favoritos.</p>}
    <ul className="mt-6 space-y-3">{items.map(item => <li key={item.id} className="rounded border border-zinc-700 bg-zinc-800 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link href={item.archivedAt ? `/wiki/${paths[item.type]}/${item.slug}` : `/${paths[item.type]}/${item.slug}`} className="min-w-0 flex-1 hover:text-amber-300">
          <h2 className="break-words font-semibold">{item.name} {item.archivedAt && <span className="text-xs text-amber-400">Arquivada</span>}</h2>
          <p className="mt-1 break-words text-sm text-zinc-400">{labels[item.type]}{item.description ? ` · ${item.description}` : ''}</p>
        </Link>
        <button type="button" onClick={() => remove(item.id)} disabled={busy || loading} className="text-sm text-amber-400 hover:text-amber-300 disabled:opacity-50">Remover dos favoritos</button>
      </div>
    </li>)}</ul>
  </div></main>
}
