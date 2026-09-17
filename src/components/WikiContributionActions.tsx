'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useAuth } from '@/components/AuthProvider'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function WikiContributionActions({ collection, slug, entityId, enabled = true, subtle = false }: { collection: string; slug?: string; entityId?: string; enabled?: boolean; subtle?: boolean }) {
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
      <Link href={slug ? `/wiki/${collection}/${slug}/edit` : `/wiki/${collection}/new`} className={`wiki-button ${subtle ? '' : 'wiki-button-primary'}`}>
        {slug ? 'Editar página' : 'Adicionar página'}
      </Link>
      {entityId && slug && <>
        <button type="button" aria-label="Arquivar página" onClick={() => dialog.current?.showModal()} className="wiki-button wiki-button-icon"><Icon icon="mdi:archive-outline" aria-hidden="true" className="h-5 w-5" /></button>
        <dialog ref={dialog} aria-labelledby="archive-title" className="rounded-lg bg-slate-900 p-6 text-slate-100 backdrop:bg-black/60">
          <h2 id="archive-title" className="text-lg font-semibold">Arquivar página</h2>
          <p className="mt-3">{slug}</p>
          <p className="mt-2 text-sm text-slate-300">Esta página ficará visível apenas para usuários logados.</p>
          {message && <p role="alert" className="mt-3 text-red-300">{message}</p>}
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => dialog.current?.close()} disabled={busy} className="wiki-button">Cancelar</button><button type="button" onClick={archive} disabled={busy} className="wiki-button wiki-button-primary">{busy ? 'Arquivando…' : 'Arquivar'}</button></div>
        </dialog>
      </>}
    </div>
  )
}
