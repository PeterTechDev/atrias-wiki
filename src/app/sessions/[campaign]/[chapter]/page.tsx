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
import { getEntityBySlug } from '@/db/queries/entities'

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

function humanizeCampaignSlug(value: string) {
  const base = value.replace(/^campanha-/, '')
  return base
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function MetadataToggle({ label, items }: { label: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-amber-700 font-crimson text-sm font-semibold">{label}:</span>
      {items.map((it, idx) => (
        <span key={`${it}-${idx}`} className="text-sm text-slate-600 font-crimson bg-amber-50 px-2 py-0.5 rounded">
          {it}
        </span>
      ))}
    </div>
  )
}

export default async function SessionLogPage({ params }: PageProps) {
  const { campaign: slug, chapter } = await params

  const chapterNumber = Number.parseInt(chapter, 10)
  const isNumericChapter = Number.isFinite(chapterNumber)

  // 1) Existing numeric chapters — backed by session_logs
  if (isNumericChapter) {
    const campaign = await getCampaignBySlug(slug)
    if (!campaign) notFound()

    const log = await getVisibleSessionLogByCampaignAndChapter(campaign.id, chapterNumber)
    if (!log) notFound()

    const { prev, next } = await getPrevNextChapterNumbers(campaign.id, chapterNumber)

    const played = formatDate(log.datePlayed)

    const hasMetadata = played ||
      (log.playersPresent && log.playersPresent.length > 0) ||
      (log.locationsVisited && log.locationsVisited.length > 0) ||
      (log.npcsEncountered && log.npcsEncountered.length > 0) ||
      (log.keyEvents && log.keyEvents.length > 0)

    return (
      <main className="min-h-screen flex flex-col bg-[#e8dcc8]">
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
        <div className="max-w-4xl mx-auto px-6 py-4">
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

        {/* Content — single column, reading-focused */}
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <div className="bg-white/80 rounded-lg shadow-lg p-8 md:p-12">
            {/* Chapter header */}
            <div className="text-center mb-10">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Capítulo {log.chapterNumber}
              </span>
              <h1 className="font-cinzel text-3xl md:text-4xl text-slate-800 mb-2">
                {log.title}
              </h1>
              {played && (
                <p className="text-slate-500 font-crimson text-sm italic">{played}</p>
              )}
            </div>

            {/* Audio narrator button */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 bg-[#0a1628] rounded-full px-6 py-3 shadow-lg">
                <Icon icon="game-icons:quill-ink" className="w-5 h-5 text-amber-400" />
                <span className="text-amber-200/80 font-crimson text-sm italic">Ouvir narração de Thaveus</span>
                <audio controls className="h-8" preload="none">
                  <source src={`/audio/${campaign.slug}/chapter-${log.chapterNumber}.mp3`} type="audio/mpeg" />
                </audio>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px bg-amber-300/50 flex-1" />
              <Icon icon="game-icons:quill-ink" className="w-5 h-5 text-amber-400" />
              <div className="h-px bg-amber-300/50 flex-1" />
            </div>

            {/* Narration */}
            <div className="text-slate-700 font-crimson text-lg leading-relaxed space-y-5">
              {(log.narration || '').split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Decorative end */}
            <div className="flex items-center justify-center gap-4 mt-10 mb-6">
              <div className="h-px bg-amber-300/50 flex-1" />
              <span className="text-amber-400 font-cinzel text-sm">✦</span>
              <div className="h-px bg-amber-300/50 flex-1" />
            </div>

            {/* Attribution */}
            <div className="text-center mb-8">
              <span className="font-crimson italic text-slate-500">
                Registrado por{' '}
                <Link href="/characters/thaveus" className="text-amber-700 hover:text-amber-900 transition-colors">
                  Thaveus, O Escriba
                </Link>
              </span>
            </div>

            {/* Metadata toggle */}
            {hasMetadata && (
              <details className="border-t border-amber-200 pt-4 mt-4">
                <summary className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-amber-700 transition-colors text-sm font-crimson">
                  <Icon icon="game-icons:info" className="w-4 h-4" />
                  <span>Ver detalhes da sessão</span>
                </summary>
                <div className="mt-4 space-y-3 pl-6">
                  {played && (
                    <div className="flex gap-2 text-sm">
                      <span className="text-amber-700 font-crimson font-semibold">Data:</span>
                      <span className="text-slate-600 font-crimson">{played}</span>
                    </div>
                  )}
                  <MetadataToggle label="Jogadores" items={log.playersPresent} />
                  <MetadataToggle label="Locais" items={log.locationsVisited} />
                  <MetadataToggle label="NPCs" items={log.npcsEncountered} />
                  <MetadataToggle label="Eventos" items={log.keyEvents} />
                </div>
              </details>
            )}

            {/* Prev/Next */}
            <div className="mt-8 pt-6 border-t border-amber-200 flex items-center justify-between gap-4">
              {prev ? (
                <Link
                  href={`/sessions/${campaign.slug}/${prev}`}
                  className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-crimson font-semibold"
                >
                  ← Capítulo {prev}
                </Link>
              ) : (
                <div />
              )}

              {next ? (
                <Link
                  href={`/sessions/${campaign.slug}/${next}`}
                  className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-crimson font-semibold"
                >
                  Capítulo {next} →
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
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

  // 2) New AI-saved sessions — backed by entities(type='session')
  const sessionEntity = await getEntityBySlug('session', chapter)
  if (!sessionEntity) notFound()

  const data = (sessionEntity.data ?? {}) as Record<string, unknown>
  const keyEvents = Array.isArray(data.keyEvents) ? data.keyEvents.filter((x): x is string => typeof x === 'string') : []
  const quotes = Array.isArray(data.quotes) ? data.quotes.filter((x): x is string => typeof x === 'string') : []
  const cliffhanger = typeof data.cliffhanger === 'string' ? data.cliffhanger : ''
  const played = formatDate(typeof data.playDate === 'string' ? data.playDate : null)
  const transcript = typeof data.transcript === 'string' ? data.transcript : ''

  const campaign = await getCampaignBySlug(slug)
  const campaignDisplayName = campaign?.name ?? humanizeCampaignSlug(slug)

  return (
    <main className="min-h-screen flex flex-col bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <Link href={`/sessions/${slug}`} className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:flag-objective" className="w-5 h-5" />
            <span>{campaignDisplayName}</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <Link href="/sessions" className="hover:text-amber-700">Sessões</Link>
          <span>›</span>
          <Link href={`/sessions/${slug}`} className="hover:text-amber-700">{campaignDisplayName}</Link>
          <span>›</span>
          <span className="text-slate-800">{sessionEntity.name}</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-white/80 rounded-lg shadow-lg p-8 md:p-12">
          <div className="text-center mb-10">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Sessão
            </span>
            <h1 className="font-cinzel text-3xl md:text-4xl text-slate-800 mb-2">{sessionEntity.name}</h1>
            {played && (
              <p className="text-slate-500 font-crimson text-sm italic">{played}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px bg-amber-300/50 flex-1" />
            <Icon icon="game-icons:quill-ink" className="w-5 h-5 text-amber-400" />
            <div className="h-px bg-amber-300/50 flex-1" />
          </div>

          <div className="text-slate-700 font-crimson text-lg leading-relaxed space-y-5">
            {(sessionEntity.description || '').split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {(keyEvents.length > 0 || quotes.length > 0 || cliffhanger || transcript) && (
            <details className="border-t border-amber-200 pt-4 mt-10">
              <summary className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-amber-700 transition-colors text-sm font-crimson">
                <Icon icon="game-icons:info" className="w-4 h-4" />
                <span>Ver detalhes</span>
              </summary>
              <div className="mt-4 space-y-4 pl-6">
                {keyEvents.length > 0 && (
                  <div>
                    <p className="text-amber-700 font-crimson text-sm font-semibold mb-1">Eventos</p>
                    <ul className="list-disc list-inside text-slate-600 font-crimson text-sm space-y-1">
                      {keyEvents.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quotes.length > 0 && (
                  <div>
                    <p className="text-amber-700 font-crimson text-sm font-semibold mb-1">Citações</p>
                    <ul className="list-disc list-inside text-slate-600 font-crimson text-sm space-y-1">
                      {quotes.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {cliffhanger && (
                  <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <p className="text-sm text-amber-800 font-crimson italic">Próxima sessão: {cliffhanger}</p>
                  </div>
                )}

                {transcript && (
                  <div>
                    <p className="text-amber-700 font-crimson text-sm font-semibold mb-1">Transcrição</p>
                    <div className="bg-[#faf8f5] border border-amber-200 rounded-lg p-3 text-slate-700 font-crimson text-sm whitespace-pre-wrap">
                      {transcript}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>

      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">&quot;As palavras registradas resistem ao tempo.&quot;</p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
