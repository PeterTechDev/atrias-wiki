'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

type ArchivedEntity = { id: string; type: string; slug: string; name: string; archivedAt: string }
const paths: Record<string, string> = { character: 'characters', place: 'places', faction: 'factions', item: 'items', lore: 'lore', monster: 'monsters' }

export default function ArchivedPages() {
  const { user, loading } = useAuth()
  const [entities, setEntities] = useState<ArchivedEntity[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const deleteDialog = useRef<HTMLDialogElement>(null)

  async function token() {
    return (await supabase.auth.getSession()).data.session?.access_token ?? ''
  }
  useEffect(() => {
    if (!user) return
    void (async () => {
      setBusy(true)
      setError('')
      try {
        const response = await fetch('/api/wiki/archived', { headers: { Authorization: `Bearer ${await token()}` }, cache: 'no-store' })
        if (!response.ok) setError('Não foi possível carregar as páginas arquivadas.')
        else setEntities((await response.json()).entities)
      } catch {
        setError('Falha de rede. Tente novamente.')
      } finally {
        setBusy(false)
      }
    })()
  }, [user])
  useEffect(() => {
    if (confirming) deleteDialog.current?.showModal()
    else if (deleteDialog.current?.open) deleteDialog.current.close()
  }, [confirming])
  function toggle(id: string) { setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }
  const allSelected = entities.length > 0 && selected.length === entities.length
  const names = useMemo(() => entities.filter((entity) => selected.includes(entity.id)).map((entity) => entity.name), [entities, selected])
  async function remove() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/wiki/archived', { method: 'DELETE', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selected }) })
      if (!response.ok) setError((await response.json()).error || 'Não foi possível excluir.')
      else { setEntities((current) => current.filter((entity) => !selected.includes(entity.id))); setSelected([]); setConfirming(false) }
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100">Carregando conta…</main>
  if (!user) return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><Link href="/login" className="text-amber-400">Entre para ver páginas arquivadas.</Link></main>

  return <main className="min-h-screen bg-zinc-900 px-4 py-8 text-zinc-100 sm:px-8">
    <div className="mx-auto max-w-4xl"><Link href="/" className="text-amber-400">← Voltar</Link><h1 className="mt-4 text-3xl font-bold text-amber-400">Páginas arquivadas</h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : entities.map((entity) => entity.id))} /> Selecionar todos ({entities.length})</label><button disabled={!selected.length || busy} onClick={() => setConfirming(true)} className="rounded bg-red-800 px-4 py-2 disabled:opacity-40">Excluir selecionados ({selected.length})</button></div>
      {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
      {busy && <p role="status" className="mt-6">Carregando…</p>}
      {!busy && !entities.length && <p className="mt-8 text-zinc-400">Nenhuma página arquivada.</p>}
      <ul className="mt-6 space-y-2">{entities.map((entity) => <li key={entity.id} className="flex items-center gap-3 rounded border border-zinc-700 bg-zinc-800 p-4"><input type="checkbox" aria-label={`Selecionar ${entity.name}`} checked={selected.includes(entity.id)} onChange={() => toggle(entity.id)} /><Link href={`/wiki/${paths[entity.type]}/${entity.slug}`} className="min-w-0 flex-1 hover:text-amber-300"><span className="block font-semibold">{entity.name} <span className="text-xs text-amber-400">Arquivada</span></span><span className="text-sm text-zinc-400">{entity.type} · {new Date(entity.archivedAt).toLocaleString('pt-BR')}</span></Link></li>)}</ul>
    </div>
    <dialog ref={deleteDialog} onCancel={() => setConfirming(false)} aria-labelledby="delete-title" className="max-w-lg rounded-lg bg-slate-900 p-6 text-slate-100 backdrop:bg-black/70"><h2 id="delete-title" className="text-xl font-semibold">Excluir definitivamente?</h2><p className="mt-3">A exclusão permanente remove {selected.length} página(s) e não pode ser desfeita.</p><ul className="mt-3 list-disc pl-5 text-sm">{names.map((name) => <li key={name}>{name}</li>)}</ul><div className="mt-6 flex justify-end gap-2"><button onClick={() => { setConfirming(false); deleteDialog.current?.close() }} disabled={busy} className="rounded border border-slate-500 px-4 py-2">Cancelar</button><button onClick={remove} disabled={busy} className="rounded bg-red-800 px-4 py-2">{busy ? 'Excluindo…' : 'Excluir definitivamente'}</button></div></dialog>
  </main>
}
