'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function WikiContributionActions({ collection, slug, entityId, enabled = true }: { collection: string; slug?: string; entityId?: string; enabled?: boolean }) {
  const { user, loading } = useAuth()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  if (!enabled || loading || !user) return null

  async function archive() {
    if (!entityId) return
    setBusy(true)
    setMessage('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/wiki/entities/${entityId}/archive`, { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token ?? ''}` } })
      if (!response.ok) setMessage((await response.json()).error || 'Não foi possível arquivar.')
      else { setMessage('Página arquivada.'); window.location.assign('/wiki/archived') }
    } catch {
      setMessage('Falha de rede. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={slug ? `/wiki/${collection}/${slug}/edit` : `/wiki/${collection}/new`} className="inline-flex items-center rounded border border-amber-700 bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800">
        {slug ? 'Editar página' : 'Adicionar página'}
      </Link>
      {entityId && slug && <>
        <button type="button" aria-label="Arquivar página" onClick={() => dialog.current?.showModal()} className="rounded border border-slate-500 px-3 py-2 text-sm hover:border-amber-400">🗄️</button>
        <dialog ref={dialog} aria-labelledby="archive-title" className="rounded-lg bg-slate-900 p-6 text-slate-100 backdrop:bg-black/60">
          <h2 id="archive-title" className="text-lg font-semibold">Arquivar página</h2>
          <p className="mt-3">{slug}</p>
          <p className="mt-2 text-sm text-slate-300">Esta página ficará visível apenas para usuários logados.</p>
          {message && <p role="alert" className="mt-3 text-red-300">{message}</p>}
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => dialog.current?.close()} disabled={busy} className="rounded border border-slate-500 px-4 py-2">Cancelar</button><button type="button" onClick={archive} disabled={busy} className="rounded bg-amber-700 px-4 py-2">{busy ? 'Arquivando…' : 'Arquivar'}</button></div>
        </dialog>
      </>}
    </div>
  )
}
