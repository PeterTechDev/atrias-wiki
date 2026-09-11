'use client'

import { useId, useState } from 'react'
import { CharacterCard } from './CharacterCard'
import { ImageUpload } from './ImageUpload'
import { getCharacterCard, type CharacterCard as Card } from '@/lib/characterCard'

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-800'

export function CharacterCardEditor({ value, onChange, name, onBusyChange }: { value: Card | null; onChange: (value: Card | null) => void; name: string; onBusyChange: (busy: boolean) => void }) {
  const titleId = useId()
  const [busy, setBusy] = useState(false)
  const preview = getCharacterCard(value)
  function uploading(next: boolean) { setBusy(next); onBusyChange(next) }

  return <section aria-labelledby={titleId} className="border-t border-slate-200 pt-6 text-slate-800">
    <h4 id={titleId} className="font-semibold">Card 3D (opcional)</h4>
    <p className="mt-1 text-sm text-slate-600">Um card por personagem, em uma seção separada da galeria.</p>
    {value ? <>
      <fieldset disabled={busy} className="mt-4 space-y-4 disabled:opacity-60">
        <legend className="sr-only">Camadas do card 3D</legend>
        {(['foreground', 'background'] as const).map(key => <div key={key}>
          <label className="block text-sm">{key === 'foreground' ? 'Personagem sem fundo (PNG ou WebP transparente)' : 'Imagem de fundo'}
            <input required value={value[key]} maxLength={2048} onChange={event => onChange({ ...value, [key]: event.target.value.trim() })} placeholder="https://… ou /images/…" className={inputClass} />
          </label>
          <div className="mt-3"><ImageUpload onUpload={url => onChange({ ...value, [key]: url })} onBusyChange={uploading} /></div>
        </div>)}
        <label className="block text-sm">Descrição do card para leitores de tela<input value={value.alt ?? ''} maxLength={1000} onChange={event => onChange({ ...value, alt: event.target.value })} className={inputClass} /></label>
        <label className="block text-sm">Crédito do card (opcional)<input value={value.credit ?? ''} maxLength={1000} onChange={event => onChange({ ...value, credit: event.target.value })} className={inputClass} /></label>
        <button type="button" onClick={() => onChange(null)} className="min-h-11 rounded px-3 text-sm text-red-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-red-800">Remover card 3D</button>
      </fieldset>
      {preview && <div className="mt-6 rounded-xl bg-[#e8dcc8] px-4 py-6"><p className="text-center text-sm font-semibold">Prévia do card</p><CharacterCard key={`${preview.foreground}:${preview.background}`} card={preview} name={name || 'Personagem'} /></div>}
    </> : <button type="button" onClick={() => onChange({ foreground: '', background: '' })} className="mt-4 min-h-11 rounded border border-amber-800 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-800">Adicionar card 3D</button>}
  </section>
}
