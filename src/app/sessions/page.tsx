/**
 * Sessions listing page
 * Session logs grouped by campaign with fantasy styling
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

// Campaigns data - will be replaced with Sanity fetch
const campaigns = [
  {
    id: 'campanha-principal',
    name: 'Campanha Principal',
    description: 'A jornada épica através dos continentes de Átrias',
    sessions: [
      // Sessions will be populated here
    ],
  },
  {
    id: 'campanha-secundaria',
    name: 'Campanha Secundária',
    description: 'Aventuras paralelas no mundo de Átrias',
    sessions: [],
  },
]

// Mocked sessions data - will be replaced with Sanity fetch
const sessions = [
  {
    id: 1,
    number: 1,
    title: 'O Início da Jornada',
    campaign: 'Campanha Principal',
    realDate: '2024-03-15',
    summary: 'Os heróis se encontram pela primeira vez na taverna do Javali Dourado...',
    charactersPresent: ['Idris Rucandel', 'Aria Ventobranco'],
    status: 'complete',
  },
  // Add more sessions as they are created
]

export default function SessionsPage() {
  // Group sessions by campaign
  const sessionsByCampaign = sessions.reduce((acc, session) => {
    const campaign = session.campaign || 'Sem Campanha'
    if (!acc[campaign]) {
      acc[campaign] = []
    }
    acc[campaign].push(session)
    return acc
  }, {} as Record<string, typeof sessions>)

  const totalSessions = sessions.length

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Icon icon="game-icons:scroll-quill" className="w-12 h-12 text-amber-700" />
              <div>
                <h1 className="font-cinzel text-4xl text-slate-800">Crônicas das Sessões</h1>
                <p className="text-slate-600 font-crimson italic">O registro de todas as aventuras</p>
              </div>
            </div>
            <Link 
              href="/sessions/new"
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Icon icon="game-icons:quill-ink" className="w-5 h-5" />
              <span>Nova Sessão</span>
            </Link>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Cada sessão é um capítulo na história de Átrias. Aqui você encontra o registro 
            de todas as aventuras vividas, decisões tomadas e destinos selados.
          </p>
          
          {/* Stats */}
          <div className="mt-6 flex gap-6">
            <div className="bg-amber-50 rounded-lg px-4 py-3">
              <p className="text-2xl font-cinzel text-amber-700">{totalSessions}</p>
              <p className="text-sm text-slate-600">Sessões Registradas</p>
            </div>
            <div className="bg-amber-50 rounded-lg px-4 py-3">
              <p className="text-2xl font-cinzel text-amber-700">{Object.keys(sessionsByCampaign).length}</p>
              <p className="text-sm text-slate-600">Campanhas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions by Campaign */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {totalSessions === 0 ? (
          <div className="text-center py-12 bg-white/80 rounded-lg shadow-lg">
            <Icon icon="game-icons:empty-hourglass" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhuma sessão registrada ainda</p>
            <p className="text-slate-500 mt-2">Que tal registrar sua primeira aventura?</p>
            <Link 
              href="/sessions/new"
              className="inline-flex items-center gap-2 mt-6 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Icon icon="game-icons:quill-ink" className="w-5 h-5" />
              <span>Registrar Primeira Sessão</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(sessionsByCampaign).map(([campaignName, campaignSessions]) => (
              <div key={campaignName} className="bg-white/80 rounded-lg shadow-lg overflow-hidden">
                {/* Campaign Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center gap-3">
                    <Icon icon="game-icons:flag-objective" className="w-6 h-6 text-amber-400" />
                    <h2 className="font-cinzel text-xl text-amber-400">{campaignName}</h2>
                    <span className="text-slate-400 text-sm">({campaignSessions.length} sessões)</span>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="divide-y divide-amber-200/50">
                  {campaignSessions
                    .sort((a, b) => b.number - a.number)
                    .map((session) => (
                      <Link
                        key={session.id}
                        href={`/sessions/${session.id}`}
                        className="group block p-4 hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Session Number Badge */}
                          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="font-cinzel text-lg text-amber-700">#{session.number}</span>
                          </div>

                          {/* Session Info */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-cinzel text-lg text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                                {session.title || `Sessão ${session.number}`}
                              </h3>
                              {session.status === 'complete' && (
                                <Icon icon="game-icons:check-mark" className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-slate-600 text-sm font-crimson line-clamp-2 mb-2">
                              {session.summary}
                            </p>

                            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Icon icon="game-icons:calendar" className="w-3 h-3" />
                                {new Date(session.realDate).toLocaleDateString('pt-BR')}
                              </span>
                              {session.charactersPresent && session.charactersPresent.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Icon icon="game-icons:person" className="w-3 h-3" />
                                  {session.charactersPresent.slice(0, 3).join(', ')}
                                  {session.charactersPresent.length > 3 && ` +${session.charactersPresent.length - 3}`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 self-center">
                            <Icon 
                              icon="game-icons:arrow-scope" 
                              className="w-5 h-5 text-amber-700/50 group-hover:text-amber-700 transition-colors" 
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Cada sessão é um capítulo. Cada decisão, uma linha na história de Átrias."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
