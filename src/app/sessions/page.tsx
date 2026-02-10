/**
 * Campaign list page (Session Logs)
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getCampaignsWithCounts } from '@/db/queries/sessionLogs'

export default async function SessionsCampaignsPage() {
  const campaigns = await getCampaignsWithCounts()

  return (
    <main className="min-h-screen bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:house" className="w-5 h-5" />
            <span>Return Home</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <span className="text-slate-800">Sessões</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4">
            <Icon icon="game-icons:scroll-quill" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Crônicas das Sessões</h1>
              <p className="text-slate-600 font-crimson italic">Campanhas e capítulos publicados</p>
            </div>
          </div>

          <p className="mt-4 text-slate-700 font-crimson text-lg">
            Cada campanha guarda seus próprios capítulos. Selecione uma campanha para ler os registros.
          </p>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-lg shadow-lg">
            <Icon icon="game-icons:empty-hourglass" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhuma campanha cadastrada ainda</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                href={`/sessions/${c.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden border border-amber-200 hover:border-amber-300 transition-colors"
              >
                <div
                  className="h-40 bg-gradient-to-br from-amber-50 via-amber-100/40 to-slate-100"
                  style={
                    c.image
                      ? {
                          backgroundImage: `url('${c.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-cinzel text-xl text-slate-800 group-hover:text-amber-800 transition-colors">
                      {c.name}
                    </h2>
                    <span className="shrink-0 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      {c.sessionCount} capítulo{c.sessionCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mt-3 text-slate-600 font-crimson line-clamp-3">{c.description}</p>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-amber-700 font-semibold">
                    <span>Ler campanha</span>
                    <Icon icon="game-icons:arrow-scope" className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            &quot;Cada sessão é um capítulo. Cada decisão, uma linha na história de Átrias.&quot;
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
