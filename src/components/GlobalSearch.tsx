'use client'

import { wikiLinkText } from '@/lib/wikiLinks'


import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import type { SearchResult } from '@/types/entities'

const categories = {
  character: ['Personagens', 'characters'], place: ['Lugares', 'places'],
  faction: ['Facções', 'factions'], item: ['Itens', 'items'],
  lore: ['Conhecimento', 'lore'], monster: ['Criaturas', 'monsters'],
  other: ['Outros', 'others'], session: ['Sessões', 'sessions'],
} as const
const suggestions = ['Átrias', 'Magia', 'Deuses']

export default function GlobalSearch() {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey) {
        event.preventDefault()
        if (!dialog.current?.open) { dialog.current?.showModal(); setOpen(true) }
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" aria-controls="global-search" aria-keyshortcuts="Control+k Meta+k" onClick={() => { dialog.current?.showModal(); setOpen(true) }} className="flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-lg border border-amber-200/25 bg-white/5 px-3 text-amber-100/80 hover:border-amber-200/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:w-56 lg:w-64">
      <Search aria-hidden="true" size={16} className="shrink-0" />
      <span className="sr-only sm:not-sr-only">Buscar na wiki…</span>
      <kbd className="ml-auto hidden font-sans text-xs text-amber-100/65 sm:inline">Ctrl K / ⌘ K</kbd>
    </button>
    <dialog ref={dialog} id="global-search" aria-label="Buscar na wiki" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); dialog.current?.close() } }} onClose={() => { setOpen(false); trigger.current?.focus() }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} className="fixed inset-x-0 top-[8dvh] m-0 mx-auto max-h-[84dvh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-[#0a1628] p-0 text-amber-50 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop:bg-black/65 backdrop:backdrop-blur-sm sm:top-[12dvh] sm:max-h-[76dvh]">
      {open && <SearchContents recent={recent} onSelect={query => {
        setRecent(previous => [query, ...previous.filter(term => term !== query)].slice(0, 5))
        dialog.current?.close()
      }} onClose={() => dialog.current?.close()} />}
    </dialog>
  </>
}

function SearchContents({ recent, onSelect, onClose }: { recent: string[]; onSelect: (query: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [response, setResponse] = useState<{ query: string; attempt: number; results: SearchResult[]; error?: boolean } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const term = query.trim()
  const ready = response?.query === term && response.attempt === attempt
  const results = ready ? response.results : []
  const error = ready && response.error
  const loading = term.length >= 2 && !ready

  useEffect(() => { input.current?.focus() }, [])

  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal, cache: 'no-store' })
        if (!result.ok) throw new Error('Search unavailable')
        const results: SearchResult[] = await result.json()
        if (!controller.signal.aborted) setResponse({ query: term, attempt, results })
      } catch {
        if (!controller.signal.aborted) setResponse({ query: term, attempt, results: [], error: true })
      }
    }, 200)
    return () => { clearTimeout(timer); controller.abort() }
  }, [term, attempt])

  function chooseSuggestion(value: string) { setQuery(value); input.current?.focus() }

  return <div className="flex max-h-[84dvh] flex-col sm:max-h-[76dvh]">
    <div className="flex shrink-0 items-center gap-3 border-b border-amber-200/15 px-4 py-3 sm:px-6">
      <Search aria-hidden="true" size={20} className="shrink-0 text-amber-200/70" />
      <label htmlFor="global-search-input" className="sr-only">Buscar na wiki</label>
      <input ref={input} id="global-search-input" type="search" autoComplete="off" maxLength={200} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && results.length) {
          event.preventDefault()
          const first = list.current?.querySelector('a')
          if (event.key === 'Enter') first?.click()
          else first?.focus()
        }
      }} placeholder="O que você procura em Átrias?" className="min-h-11 min-w-0 flex-1 rounded bg-transparent text-base text-amber-50 caret-amber-300 placeholder:text-amber-100/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400" />
      <button type="button" aria-label="Fechar busca" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-amber-100/70 hover:bg-white/10 hover:text-amber-50 focus-visible:outline-2 focus-visible:outline-amber-400"><X aria-hidden="true" size={20} /></button>
    </div>
    <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6" style={{ scrollbarColor: '#a8935a #0a1628', scrollbarWidth: 'thin' }}>
      {!term && <div className="space-y-6 pb-2">
        {recent.length > 0 && <div><h2 className="mb-3 text-sm text-amber-100/70">Pesquisas recentes</h2><div className="flex flex-wrap gap-2">{recent.map(value => <button key={value} type="button" onClick={() => chooseSuggestion(value)} className="min-h-11 max-w-full break-words rounded-full border border-amber-200/25 px-4 py-2 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">{value}</button>)}</div></div>}
        <div><h2 className="mb-3 text-sm text-amber-100/70">Sugestões de busca</h2><div className="flex flex-wrap gap-2">{suggestions.map(value => <button key={value} type="button" onClick={() => chooseSuggestion(value)} className="min-h-11 rounded-full border border-amber-200/25 px-4 py-2 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">{value}</button>)}</div></div>
      </div>}
      <p role="status" className="text-sm text-amber-100/70">{term && term.length < 2 ? 'Digite pelo menos 2 caracteres.' : loading ? 'Buscando nos arquivos…' : error ? '' : term && results.length ? `${results.length === 20 ? 'Primeiros 20' : results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : term ? `Nenhum registro encontrado para “${term}”. Tente outro nome ou termo.` : ''}</p>
      {error && <div role="alert"><p>Não foi possível buscar agora.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 min-h-11 rounded text-amber-200 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-400">Tentar novamente</button></div>}
      {results.length > 0 && <ul ref={list} className="mt-3 space-y-1" onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
        const links = Array.from(list.current?.querySelectorAll('a') ?? [])
        const index = links.indexOf(document.activeElement as HTMLAnchorElement)
        event.preventDefault()
        if (event.key === 'ArrowUp' && index === 0) input.current?.focus()
        else links[Math.min(links.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)))]?.focus()
      }}>{results.map(result => <li key={result.id}>
        <Link href={`/${categories[result.type][1]}/${result.slug}`} onClick={() => onSelect(term)} className="block rounded-lg px-3 py-3 hover:bg-amber-100/10 focus-visible:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-400">
          <span className="text-xs text-amber-100/65">Arquivos › {categories[result.type][0]}</span>
          <span className="mt-1 block break-words font-crimson text-xl font-semibold text-amber-50">{result.name}</span>
          {result.description && <span className="mt-1 line-clamp-2 break-words text-sm leading-6 text-amber-100/75">{wikiLinkText(result.description)}</span>}
        </Link>
      </li>)}</ul>}
    </div>
  </div>
}
