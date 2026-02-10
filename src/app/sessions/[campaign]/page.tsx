/**
 * Campaign page (chapter list)
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getCampaignBySlug, getVisibleSessionLogsForCampaign } from '@/db/queries/sessionLogs'

interface PageProps {
  params: Promise<{ campaign: string }>
}

function formatDate(date: unknown) {
  if (!date) return null
  try {
    // drizzle date('...') returns string (YYYY-MM-DD) with node-postgres
    const d = typeof date === 'string' ? new Date(date) : new Date(String(date))
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('pt-BR')
  } catch {
    return null
  }
}

export default async function CampaignPage({ params }: PageProps) {
  const { campaign: slug } = await params

  const campaign = await getCampaignBySlug(slug)
  if (!campaign) notFound()

  const chapters = await getVisibleSessionLogsForCampaign(campaign.id)

  return (
    <main className="min-h-screen bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <Link href="/sessions" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:scroll-quill" className="w-5 h-5" />
            <span>Sessões</span>
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
          <span className="text-slate-800">{campaign.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Campaign Header */}
        <div className="bg-white/80 rounded-lg shadow-lg overflow-hidden mb-8">
          <div
            className="h-52 bg-gradient-to-br from-amber-50 via-amber-100/40 to-slate-100"
            style={
              campaign.image
                ? {
                    backgroundImage: `url('${campaign.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon icon="game-icons:flag-objective" className="w-7 h-7 text-amber-700" />
              <h1 className="font-cinzel text-4xl text-slate-800">{campaign.name}</h1>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                {chapters.length} capítulo{chapters.length === 1 ? '' : 's'}
              </span>
            </div>
            {campaign.description && (
              <p className="text-slate-700 font-crimson text-lg">{campaign.description}</p>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div className="bg-white/80 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-[#0a1628] p-4">
            <div className="flex items-center gap-3">
              <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-400" />
              <h2 className="font-cinzel text-xl text-amber-400">Capítulos</h2>
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="p-8 text-slate-600 font-crimson">
              Nenhum capítulo publicado ainda.
            </div>
          ) : (
            <div className="divide-y divide-amber-200/50">
              {chapters.map((ch) => {
                const played = formatDate(ch.datePlayed)
                const badgeClass =
                  ch.status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'

                return (
                  <Link
                    key={ch.id}
                    href={`/sessions/${campaign.slug}/${ch.chapterNumber}`}
                    className="group block p-5 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-cinzel text-lg text-slate-800 group-hover:text-amber-800 transition-colors truncate">
                          Capítulo {ch.chapterNumber} — {ch.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                          {played && (
                            <span className="flex items-center gap-1">
                              <Icon icon="game-icons:calendar" className="w-3 h-3" />
                              {played}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
                          {ch.status}
                        </span>
                        <Icon
                          icon="game-icons:arrow-scope"
                          className="w-5 h-5 text-amber-700/50 group-hover:text-amber-700 transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            &quot;Os pergaminhos não mentem — apenas aguardam a leitura.&quot;
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
