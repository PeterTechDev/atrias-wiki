'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { favoriteRequest } from '@/lib/wikiFavorites'
import { wikiLinkText } from '@/lib/wikiLinks'

type Favorite = { id: string; slug: string; name: string; type: string; description: string | null; archivedAt: string | null }
const paths: Record<string, string> = { character: 'characters', place: 'places', faction: 'factions', item: 'items', lore: 'lore', monster: 'monsters' }
const labels: Record<string, string> = { character: 'Personagem', place: 'Lugar', faction: 'Facção', item: 'Item', lore: 'Lore', monster: 'Monstro' }

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  return <main className="min-h-screen bg-zinc-900 px-4 py-8 text-zinc-100 selection:bg-amber-300 selection:text-zinc-950 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/" className="inline-flex min-h-11 items-center rounded text-amber-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">Início</Link>
    <h1 className="mt-4 font-cinzel text-3xl font-bold text-amber-400">Favoritos</h1>
    {loading ? <p role="status" className="mt-6">Carregando conta…</p> : !user || user.is_anonymous ? <div className="mt-6">
      <p className="text-zinc-300">Entre na sua conta para acessar suas páginas favoritas.</p>
      <Link href="/login?next=/wiki/favorites" className="mt-4 inline-flex min-h-11 items-center rounded px-3 text-amber-400 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-400">Entrar para ver favoritos</Link>
    </div> : <Favorites key={user.id} userId={user.id} />}
  </div></main>
}

function Favorites({ userId }: { userId: string }) {
  const [items, setItems] = useState<Favorite[]>([])
  const [error, setError] = useState<{ message: string; removeId?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void favoriteRequest(userId).then(data => {
      if (active) setItems(data.favorites)
    }).catch(() => {
      if (active) setError({ message: 'Não foi possível carregar os favoritos.' })
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId, attempt])

  async function remove(id: string) {
    setBusy(id)
    setError(null)
    setStatus('')
    try {
      await favoriteRequest(userId, `/${id}`, 'DELETE')
      setItems(current => current.filter(item => item.id !== id))
      setStatus('Página removida dos favoritos.')
    } catch {
      setError({ message: 'Não foi possível remover o favorito.', removeId: id })
    } finally {
      setBusy(null)
    }
  }

  return <>
    {error && <div role="alert" className="mt-4 text-red-300"><p>{error.message}</p><button type="button" disabled={!!busy || loading} onClick={() => {
      if (error.removeId) { void remove(error.removeId); return }
      setError(null); setLoading(true); setAttempt(value => value + 1)
    }} className="min-h-11 rounded px-3 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-400 disabled:opacity-50">{error.removeId ? 'Tentar remover novamente' : 'Recarregar favoritos'}</button></div>}
    <p role="status" className="sr-only">{status}</p>
    {loading && <p role="status" className="mt-6">Carregando…</p>}
    {!loading && !items.length && !error && <div className="mt-8">
      <p className="text-zinc-300">Você ainda não adicionou páginas aos favoritos.</p>
      <p className="mt-2 text-sm text-zinc-400">Abra uma página e use a estrela “Adicionar aos favoritos” para encontrá-la aqui.</p>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded px-3 text-amber-400 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-400">Explorar a wiki</Link>
    </div>}
    <ul className="mt-6 space-y-3">{items.map(item => <li key={item.id} className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 sm:p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-6">
        <div className="min-w-0 flex-1 self-stretch">
          <h2 className="break-words text-lg font-semibold"><Link href={item.archivedAt ? `/wiki/${paths[item.type]}/${item.slug}` : `/${paths[item.type]}/${item.slug}`} className="rounded text-amber-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">{item.name}</Link></h2>
          <p className="mt-1 text-xs text-zinc-400">{labels[item.type]}{item.archivedAt && <span className="ml-2 text-amber-400">Arquivada</span>}</p>
          {item.description && <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-zinc-300">{wikiLinkText(item.description)}</p>}
        </div>
        <button type="button" onClick={() => remove(item.id)} disabled={!!busy || loading} aria-label={`${busy === item.id ? 'Removendo' : 'Remover'} ${item.name} dos favoritos`} className="min-h-11 shrink-0 rounded-md px-3 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:opacity-50">{busy === item.id ? 'Removendo…' : 'Remover dos favoritos'}</button>
      </div>
    </li>)}</ul>
  </>
}
