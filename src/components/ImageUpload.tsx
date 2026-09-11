'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function ImageUpload({ onUpload, onBusyChange }: { onUpload: (url: string) => void; onBusyChange: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  return <div>
    <label className="block text-sm font-medium text-slate-800">Enviar foto
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block min-h-11 w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-amber-100 file:px-4 file:py-3 file:text-amber-950 focus-visible:outline-2 focus-visible:outline-amber-800" onChange={async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        setError('')
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) {
          setError('Escolha uma imagem JPG, PNG ou WebP de até 5 MB.'); return
        }
        setBusy(true); onBusyChange(true)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user || user.is_anonymous) throw new Error('Entre na sua conta para enviar fotos.')
          const path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`
          const bucket = supabase.storage.from('wiki-media')
          const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false })
          if (error) throw new Error('Não foi possível enviar a foto. Tente novamente; os outros campos foram mantidos.')
          // ponytail: immutable shared files; add an orphan sweep if abandoned uploads accumulate.
          onUpload(bucket.getPublicUrl(path).data.publicUrl)
        } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível enviar a foto.') }
        finally { setBusy(false); onBusyChange(false) }
      }} />
    </label>
    <p className="mt-1 text-xs text-slate-600">JPG, PNG ou WebP, até 5 MB. As fotos enviadas são públicas.</p>
    {busy && <p role="status" className="mt-2 text-sm text-amber-900">Enviando foto…</p>}
    {error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}
  </div>
}
