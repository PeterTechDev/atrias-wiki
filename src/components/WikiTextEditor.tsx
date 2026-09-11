'use client'

import { useEffect, useRef, useState, type TextareaHTMLAttributes } from 'react'
import { entityTypeToCollection } from '@/app/admin/_lib/entityTypes'
import type { SearchResult } from '@/types/entities'
import { insertWikiLink } from '@/lib/wikiLinks'
import { WikiText } from './WikiText'

export function WikiTextEditor({ value, onChange, ...props }: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & { value: string; onChange: (value: string) => void }) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const selection = useRef({ start: 0, end: 0 })
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!open || query.trim().length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error()
        const pages: SearchResult[] = await response.json()
        if (controller.signal.aborted) return
        const matches = pages.filter(page => page.type !== 'session')
        setResults(matches)
        setStatus(matches.length ? '' : 'Nenhuma página encontrada. Tente outro nome.')
      } catch {
        if (!controller.signal.aborted) setStatus('Não foi possível buscar. Altere a busca para tentar novamente.')
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [open, query])

  function search(text: string) {
    setQuery(text)
    setResults([])
    setStatus(text.trim().length < 2 ? 'Digite pelo menos 2 caracteres.' : 'Buscando páginas…')
  }

  function close() {
    setOpen(false)
    textarea.current?.focus()
  }

  function insert(page: SearchResult) {
    const { start, end } = selection.current
    const next = insertWikiLink(value, start, end, page.name, `/${entityTypeToCollection[page.type]}/${page.slug}`)
    if (props.maxLength && next.value.length > props.maxLength) {
      setStatus('A referência ultrapassa o limite de texto deste campo.')
      return
    }
    onChange(next.value)
    setOpen(false)
    requestAnimationFrame(() => {
      textarea.current?.focus()
      textarea.current?.setSelectionRange(next.cursor, next.cursor)
    })
  }

  return <div>
    <textarea {...props} ref={textarea} value={value} onChange={event => { setOpen(false); onChange(event.target.value) }} />
    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
      <button type="button" disabled={props.disabled} aria-expanded={open} className="min-h-11 rounded border border-amber-800 px-3 text-amber-900 hover:bg-amber-50 focus-visible:outline-2" onClick={() => {
        selection.current = { start: textarea.current?.selectionStart ?? value.length, end: textarea.current?.selectionEnd ?? value.length }
        search(value.slice(selection.current.start, selection.current.end))
        setOpen(true)
      }}>Inserir referência</button>
      <button type="button" aria-expanded={preview} className="min-h-11 underline underline-offset-4" onClick={() => setPreview(!preview)}>{preview ? 'Ocultar prévia' : 'Ver prévia'}</button>
      <span>Selecione um trecho para transformá-lo em link.</span>
    </div>
    {open && <div className="mt-2 rounded border border-stone-300 bg-white p-3 text-slate-900" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close() } }}>
      <label className="block text-sm">Buscar página na wiki
        <input autoFocus value={query} onChange={event => search(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') event.preventDefault() }} className="mt-1 min-h-11 w-full rounded border border-slate-300 px-3" />
      </label>
      <p role="status" className="mt-2 text-sm">{status}</p>
      <ul className="max-h-60 overflow-y-auto">{results.map(page => <li key={page.id}><button type="button" className="min-h-11 w-full rounded px-2 py-2 text-left hover:bg-amber-50 focus-visible:outline-2" onClick={() => insert(page)}>{page.name}<span className="ml-2 text-xs text-slate-500">/{entityTypeToCollection[page.type]}/{page.slug}</span></button></li>)}</ul>
      <button type="button" className="mt-2 min-h-11 underline" onClick={close}>Cancelar</button>
    </div>}
    {preview && <div className="mt-3 whitespace-pre-wrap break-words rounded border border-stone-300 bg-white p-4 text-slate-800"><WikiText text={value} /></div>}
  </div>
}
