/**
 * Individual chapter page (Session Log)
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import {
  getCampaignBySlug,
  getPrevNextChapterNumbers,
  getVisibleSessionLogByCampaignAndChapter,
} from '@/db/queries/sessionLogs'

interface PageProps {
  params: Promise<{ campaign: string; chapter: string }>
}

function formatDate(date: unknown) {
  if (!date) return null
  try {
    const d = typeof date === 'string' ? new Date(date) : new Date(String(date))
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('pt-BR')
  } catch {
    return null
  }
}

function ListBlock({ title, items }: { title: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null

  return (
    <div>
      <h3 className="font-cinzel text-amber-400/90 text-sm uppercase tracking-wider mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((it, idx) => (
          <li key={`${it}-${idx}`} className="text-slate-100/90 font-crimson">
            <span className="text-amber-400/70">•</span> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function SessionLogPage({ params }: PageProps) {
  const { campaign: slug, chapter } = await params
  const chapterNumber = Number.parseInt(chapter, 10)
  if (!Number.isFinite(chapterNumber)) notFound()

  const campaign = await getCampaignBySlug(slug)
  if (!campaign) notFound()

  const log = await getVisibleSessionLogByCampaignAndChapter(campaign.id, chapterNumber)
  if (!log) notFound()

  const { prev, next } = await getPrevNextChapterNumbers(campaign.id, chapterNumber)

  const played = formatDate(log.datePlayed)

  return (
    <main className="min-h-screen bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <Link href={`/sessions/${campaign.slug}`} className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:flag-objective" className="w-5 h-5" />
            <span>{campaign.name}</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <Link href="/sessions" className="hover:text-amber-700">Sessões</Link>
          <span>›</span>
          <Link href={`/sessions/${campaign.slug}`} className="hover:text-amber-700">{campaign.name}</Link>
          <span>›</span>
          <span className="text-slate-800">Capítulo {log.chapterNumber}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Capítulo {log.chapterNumber}
                </span>
                {played && (
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Icon icon="game-icons:calendar" className="w-4 h-4" />
                    {played}
                  </span>
                )}
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                  {log.status}
                </span>
              </div>

              <h1 className="font-cinzel text-3xl md:text-4xl text-slate-800 mb-6">
                {log.title}
              </h1>

              <div className="text-slate-700 font-crimson text-lg leading-relaxed space-y-4">
                {(log.narration || '').split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Attribution */}
              <div className="mt-8 pt-6 border-t border-amber-200 flex items-center gap-3 text-slate-600">
                <Icon icon="game-icons:quill-ink" className="w-5 h-5 text-amber-700" />
                <span className="font-crimson italic">
                  Registrado por:{' '}
                  <Link href="/characters/thaveus" className="text-amber-800 hover:text-amber-900 underline">
                    Thaveus, O Escriba
                  </Link>
                </span>
              </div>

              {/* Prev/Next */}
              <div className="mt-6 flex items-center justify-between gap-4">
                {prev ? (
                  <Link
                    href={`/sessions/${campaign.slug}/${prev}`}
                    className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-semibold"
                  >
                    <Icon icon="game-icons:arrow-left" className="w-5 h-5" />
                    Capítulo {prev}
                  </Link>
                ) : (
                  <div />
                )}

                {next ? (
                  <Link
                    href={`/sessions/${campaign.slug}/${next}`}
                    className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-semibold"
                  >
                    Capítulo {next}
                    <Icon icon="game-icons:arrow-right" className="w-5 h-5" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#0a1628] text-white rounded-lg p-6 sticky top-6">
              <h2 className="font-cinzel text-amber-400 text-lg mb-4 uppercase tracking-wider">
                Metadados
              </h2>

              <div className="space-y-6">
                {played && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Data jogada</span>
                    <p className="text-white font-medium">{played}</p>
                  </div>
                )}

                <ListBlock title="Jogadores presentes" items={log.playersPresent} />
                <ListBlock title="Locais visitados" items={log.locationsVisited} />
                <ListBlock title="NPCs encontrados" items={log.npcsEncountered} />
                <ListBlock title="Eventos-chave" items={log.keyEvents} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            &quot;As palavras registradas resistem ao tempo.&quot;
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
