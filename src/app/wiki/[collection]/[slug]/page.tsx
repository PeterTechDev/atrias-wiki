'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

const types: Record<string, string> = { characters: 'character', places: 'place', factions: 'faction', items: 'item', lore: 'lore', monsters: 'monster', others: 'other' }

export default function ArchivedDetail() {
  const { collection, slug } = useParams<{ collection: string; slug: string }>()
  const { user, loading } = useAuth()
  const [entity, setEntity] = useState<{ name: string; description: string | null; archivedAt: string; type: string } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { if (!user || !types[collection]) return; void (async () => { const session = (await supabase.auth.getSession()).data.session; const response = await fetch(`/api/wiki/entities?type=${types[collection]}&slug=${encodeURIComponent(slug)}`, { headers: { Authorization: `Bearer ${session?.access_token ?? ''}` }, cache: 'no-store' }); if (response.ok) setEntity((await response.json()).entity); else setError('Página arquivada não encontrada.') })() }, [user, collection, slug])
  if (loading) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100">Carregando…</main>
  if (!user) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><Link href="/login" className="text-amber-400">Entre para ver esta página arquivada.</Link></main>
  return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><div className="mx-auto max-w-3xl"><Link href="/wiki/archived" className="text-amber-400">← Páginas arquivadas</Link>{error ? <p className="mt-8 text-red-300">{error}</p> : entity && <><p className="mt-8 text-sm uppercase text-amber-400">Arquivada · {entity.type}</p><h1 className="mt-2 text-4xl font-bold">{entity.name}</h1><p className="mt-6 whitespace-pre-wrap text-zinc-300">{entity.description}</p><p className="mt-8 text-sm text-zinc-500">Arquivada em {new Date(entity.archivedAt).toLocaleString('pt-BR')}</p></>}</div></main>
}
