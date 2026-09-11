import Link from 'next/link'
import { Icon } from '@iconify/react'
import { WikiContributionActions } from './WikiContributionActions'
import { WikiArchiveList, type ArchiveEntry } from './WikiArchiveList'

export function WikiArchive({ title, subtitle, icon, collection, entries }: {
  title: string; subtitle: string; icon: string; collection: string; entries: ArchiveEntry[]
}) {
  return (
    <main className="min-h-screen bg-[#e8dcc8] text-slate-800 selection:bg-amber-200 selection:text-slate-900">

      <div className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-6">
        <nav aria-label="Navegação estrutural" className="flex flex-wrap items-center gap-2 py-4 text-sm">
          <Link href="/browse" className="inline-flex min-h-11 items-center text-amber-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">Arquivos</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{title}</span>
        </nav>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1 basis-64">
            <div className="flex items-center gap-3">
              <Icon icon={icon} className="hidden h-8 w-8 shrink-0 text-amber-800 sm:block" aria-hidden="true" />
              <h1 className="min-w-0 break-words font-cinzel text-3xl leading-tight text-balance sm:text-4xl">{title}</h1>
            </div>
            <p className="mt-2 font-manuscript text-base italic text-slate-600">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">{collection === 'places' && <Link href="/map" className="inline-flex min-h-11 items-center gap-2 text-sm text-amber-900 underline-offset-4 hover:underline"><Icon icon="mdi:map-outline" aria-hidden="true" />Explorar o mapa</Link>}<WikiContributionActions collection={collection} enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} subtle /></div>
        </div>
        <WikiArchiveList collection={collection} entries={entries} />
      </div>
    </main>
  )
}
