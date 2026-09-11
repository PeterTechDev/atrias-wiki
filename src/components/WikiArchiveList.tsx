'use client'

import { wikiLinkText } from '@/lib/wikiLinks'


import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'

export type ArchiveEntry = {
  slug: string; name: string; description: string | null; image?: string | null
  metadata?: (string | undefined)[]
}

export function filterArchiveEntries(entries: ArchiveEntry[], query: string) {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
  const term = normalize(query)
  return entries.filter((entry) => normalize(entry.name).includes(term))
}

export function WikiArchiveList({ collection, entries }: { collection: string; entries: ArchiveEntry[] }) {
  const [query, setQuery] = useState('')
  const visible = filterArchiveEntries(entries, query)
  return (
    <section aria-label="Registros">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:max-w-sm">
          <label htmlFor="archive-search" className="mb-2 block text-sm font-semibold">Buscar por nome</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-amber-800" />
            <input id="archive-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite um nome…" className="min-h-11 w-full rounded border border-amber-800/40 bg-white/70 py-2 pr-3 pl-10 text-base text-slate-800 caret-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800" />
          </div>
        </div>
        <p role="status" className="text-sm text-slate-600 tabular-nums">{visible.length} de {entries.length} registros · A–Z</p>
      </div>
      {visible.length ? (
        <ul className="divide-y divide-amber-900/20 border-y border-amber-900/30">
          {visible.map((entry) => (
            <li key={entry.slug} className="relative flex items-start gap-4 py-5 sm:gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-crimson text-2xl leading-7 font-semibold break-words">
                  <Link href={`/${collection}/${entry.slug}`} className="underline-offset-4 after:absolute after:inset-0 hover:text-amber-800 hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-amber-800">{entry.name}</Link>
                </h2>
                {entry.metadata?.some(Boolean) && <p className="mt-1 text-sm leading-6 break-words text-amber-900">{entry.metadata.filter(Boolean).join(' · ')}</p>}
                <p className="mt-1 line-clamp-2 max-w-[72ch] font-crimson text-lg leading-6 break-words text-slate-600">{wikiLinkText(entry.description || 'Registro sem descrição.')}</p>
              </div>
              {entry.image && <img src={entry.image} alt="" width={72} height={80} loading="lazy" className="h-20 w-16 shrink-0 rounded object-cover object-top sm:w-[72px]" />}
              <ArrowUpRight aria-hidden="true" className="mt-1 hidden h-5 w-5 shrink-0 text-amber-800 sm:block" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-t border-amber-900/30 py-10">
          <p className="font-crimson text-xl">{entries.length ? 'Nenhum registro corresponde à busca.' : 'Ainda não há registros nesta categoria.'}</p>
          {entries.length > 0 && <button type="button" onClick={() => setQuery('')} className="mt-3 min-h-11 text-amber-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">Limpar busca</button>}
        </div>
      )}
    </section>
  )
}
