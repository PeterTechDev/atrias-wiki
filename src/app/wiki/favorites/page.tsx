'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

type Favorite = { id: string; slug: string; name: string; type: string; description: string | null; archivedAt: string | null }
const paths: Record<string, string> = { character: 'characters', place: 'places', faction: 'factions', item: 'items', lore: 'lore', monster: 'monsters' }

export default function FavoritesPage() {
  const { user, loading } = useAuth(); const [items, setItems] = useState<Favorite[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { if (!user) { setItems([]); return }; let active = true; void (async () => { setBusy(true); setError(''); try { const token = (await supabase.auth.getSession()).data.session?.access_token; const r = await fetch('/api/wiki/favorites', { headers: { Authorization: `Bearer ${token ?? ''}` }, cache: 'no-store' }); if (!r.ok) throw new Error(); if (active) setItems((await r.json()).favorites) } catch { if (active) setError('Não foi possível carregar os favoritos.') } finally { if (active) setBusy(false) } })(); return () => { active = false } }, [user])
  async function remove(id: string) { setBusy(true); try { const token = (await supabase.auth.getSession()).data.session?.access_token; const r = await fetch(`/api/wiki/favorites/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token ?? ''}` } }); if (!r.ok) throw new Error(); setItems(current => current.filter(item => item.id !== id)) } catch { setError('Não foi possível remover o favorito.') } finally { setBusy(false) } }
  if (loading) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100">Carregando conta…</main>
  if (!user) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><Link href="/login?next=/wiki/favorites" className="text-amber-400">Entre para ver seus favoritos.</Link></main>
  return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><div className="mx-auto max-w-3xl"><Link href="/" className="text-amber-400">← Voltar</Link><h1 className="mt-4 text-3xl font-bold text-amber-400">Favoritos</h1>{error && <p role="alert" className="mt-4 text-red-300">{error}</p>}{busy && !items.length && <p role="status" className="mt-6">Carregando…</p>}{!busy && !items.length && !error && <p className="mt-8 text-zinc-400">Você ainda não adicionou páginas aos favoritos.</p>}<ul className="mt-6 space-y-3">{items.map(item => <li key={item.id} className="rounded border border-zinc-700 bg-zinc-800 p-4"><div className="flex items-start justify-between gap-4"><Link href={item.archivedAt ? `/wiki/${paths[item.type]}/${item.slug}` : `/${paths[item.type]}/${item.slug}`} className="min-w-0 flex-1 hover:text-amber-300"><h2 className="font-semibold">{item.name} {item.archivedAt && <span className="text-xs text-amber-400">Arquivada</span>}</h2><p className="mt-1 text-sm text-zinc-400">{item.type}{item.description ? ` · ${item.description}` : ''}</p></Link><button type="button" onClick={() => remove(item.id)} disabled={busy} className="shrink-0 text-sm text-amber-400 hover:text-amber-300 disabled:opacity-50">Remover dos favoritos</button></div></li>)}</ul></div></main>
}
