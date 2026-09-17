'use client'

import { useId, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { ArrowUp, ArrowDown, Plus } from 'lucide-react'
import { moveWikiSection, type WikiSection } from '@/lib/wikiSections'
import { WikiTextEditor } from './WikiTextEditor'
import { WikiSections } from './WikiSections'

const action = 'wiki-button'
const field = 'mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-800'

export function WikiSectionsEditor({ value, onChange }: { value: WikiSection[]; onChange: (value: WikiSection[]) => void }) {
  const id = useId()
  const root = useRef<HTMLElement>(null)
  const pendingFocus = useRef<number | null>(null)
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState('')
  const [removed, setRemoved] = useState<{ section: WikiSection; index: number } | null>(null)
  useLayoutEffect(() => {
    if (pendingFocus.current === null) return
    root.current?.querySelector<HTMLInputElement>(`[data-block-title="${pendingFocus.current}"]`)?.focus()
    pendingFocus.current = null
  }, [value, preview])
  function focus(index: number) {
    pendingFocus.current = index
  }
  function move(index: number, step: number) {
    onChange(moveWikiSection(value, index, step))
    setStatus(`Bloco ${index + 1} movido para a posição ${index + step + 1}.`)
    focus(index + step)
  }
  return <section ref={root} aria-labelledby={`${id}-heading`} className="border-t border-stone-300 pt-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-slate-800">Blocos de texto</h2>
      {!!value.length && <button type="button" className={action} aria-expanded={preview} onClick={() => setPreview(!preview)}>{preview ? 'Voltar à edição' : 'Prévia dos blocos'}</button>}
    </div>
    <p className="mt-2 text-sm text-slate-600">Organize a página em seções, como História, Cultura ou Aparência. Use as setas para escolher a ordem.</p>
    <p role="status" className="sr-only">{status}</p>
    <div hidden={preview} onInvalidCapture={() => flushSync(() => setPreview(false))}>
      {!value.length && <p className="mt-4 text-sm text-slate-600">A introdução já pode ser salva. Adicione um bloco quando quiser detalhar outro assunto.</p>}
      {value.map((section, index) => <fieldset key={index} className="mt-6 min-w-0 border-b border-stone-300 pb-6">
        <legend className="mb-2 font-semibold text-slate-800">Bloco {index + 1}</legend>
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={action} disabled={!index} aria-label={`Mover bloco ${index + 1} para cima`} onClick={() => move(index, -1)}><ArrowUp size={18} aria-hidden="true" /></button>
          <button type="button" className={action} disabled={index === value.length - 1} aria-label={`Mover bloco ${index + 1} para baixo`} onClick={() => move(index, 1)}><ArrowDown size={18} aria-hidden="true" /></button>
          <button type="button" className={`${action} wiki-button-danger`} onClick={() => { setRemoved({ section, index }); onChange(value.filter((_, i) => i !== index)); setStatus(`Bloco ${index + 1} removido. Você pode desfazer.`) }}>Remover bloco {index + 1}</button>
        </div>
        <label className="block text-sm text-slate-700">Título do bloco {index + 1}<input data-block-title={index} required maxLength={120} value={section.title} className={field} onChange={event => onChange(value.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} /></label>
        <label htmlFor={`${id}-text-${index}`} className="mt-4 block text-sm text-slate-700">Texto do bloco {index + 1}</label>
        <WikiTextEditor id={`${id}-text-${index}`} required rows={6} maxLength={50000} value={section.content} className={field} onChange={content => onChange(value.map((item, i) => i === index ? { ...item, content } : item))} />
      </fieldset>)}
    </div>
    {preview && <WikiSections sections={value} />}
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" className={action} disabled={value.length >= 30} onClick={() => { setPreview(false); onChange([...value, { title: '', content: '' }]); focus(value.length) }}><Plus size={18} aria-hidden="true" />Adicionar bloco</button>
      <span className="text-sm text-slate-600">{value.length} de 30 blocos</span>
      {removed && <button type="button" className={action} disabled={value.length >= 30} onClick={() => { const next = [...value]; next.splice(removed.index, 0, removed.section); onChange(next); setRemoved(null); setPreview(false); focus(Math.min(removed.index, value.length)) }}>Desfazer remoção</button>}
    </div>
  </section>
}
