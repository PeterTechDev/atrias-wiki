'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DMPermissions({ users }: { users: { id: string; name: string; isDM: boolean }[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  async function change(user: typeof users[number]) {
    setBusy(user.id)
    setMessage('')
    try {
      const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, isDM: !user.isDM }) })
      if (!response.ok) throw new Error((await response.json()).error)
      setMessage(`Permissão de ${user.name} atualizada.`)
      router.refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.') }
    finally { setBusy(null) }
  }
  return <div className="space-y-4">
    <p role="status">{message}</p>
    {!users.length && <p>Nenhum usuário cadastrado.</p>}
    {users.map(user => <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-amber-300 p-4">
      <div><p className="font-semibold">{user.name} {user.isDM && '— DM'}</p><p className="break-all text-xs text-slate-600">{user.id}</p></div>
      <button type="button" disabled={busy !== null} onClick={() => change(user)} aria-label={`${user.isDM ? 'Remover' : 'Conceder'} DM: ${user.name}`} className="rounded bg-slate-900 px-4 py-2 text-amber-200 disabled:opacity-50">{busy === user.id ? 'Salvando…' : user.isDM ? 'Remover DM' : 'Conceder DM'}</button>
    </div>)}
  </div>
}
