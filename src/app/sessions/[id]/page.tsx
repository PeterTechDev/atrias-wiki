/**
 * Session detail page
 * Shows full session recap with fantasy styling
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { notFound } from 'next/navigation'

// Generate static params for export
export function generateStaticParams() {
  // For now, generate params for session IDs 1-10
  // This will be replaced with Sanity fetch later
  return Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }))
}

// Mocked session data - will be replaced with Sanity fetch
const sessions: Record<string, {
  id: number
  number: number
  title: string
  campaign: string
  realDate: string
  inGameDate?: string
  summary: string
  keyEvents: string[]
  quotes?: string[]
  cliffhanger?: string
  charactersPresent: string[]
  locationsVisited?: string[]
  itemsFound?: string[]
  dmNotes?: string
}> = {
  '1': {
    id: 1,
    number: 1,
    title: 'O Início da Jornada',
    campaign: 'Campanha Principal',
    realDate: '2024-03-15',
    inGameDate: '15 de Solstice, 1247',
    summary: `Os heróis se encontram pela primeira vez na taverna do Javali Dourado, em Solaria. Uma noite que parecia comum rapidamente se transformou em algo mais quando um mensageiro ferido chegou com notícias urgentes do norte.

A cidade estava em polvorosa. Rumores de criaturas estranhas nos campos e desaparecimentos misteriosos já circulavam há semanas, mas ninguém queria acreditar. Até agora.

O grupo, unido pelo acaso ou pelo destino, decidiu investigar. Mal sabiam eles que esta seria apenas a primeira de muitas noites longas pela frente.`,
    keyEvents: [
      'Os personagens se conheceram na Taverna do Javali Dourado',
      'Mensageiro chegou ferido com notícias do norte',
      'Primeiro encontro com as sombras nas estradas',
      'Decisão de investigar os desaparecimentos',
    ],
    quotes: [
      '"A escuridão não é nossa inimiga — é o que se esconde nela." — Idris Rucandel',
      '"Alguém pediu uma cerveja? Não? Então vou ficar com todas." — Aria',
    ],
    cliffhanger: 'O grupo parte ao amanhecer rumo às Planícies de Vellenor, seguindo o rastro do mensageiro.',
    charactersPresent: ['Idris Rucandel', 'Aria Ventobranco', 'Theron Silva Escura'],
    locationsVisited: ['Solaria', 'Taverna do Javali Dourado'],
    itemsFound: ['Carta selada com símbolo desconhecido', 'Mapa rasgado'],
  },
}

export default function SessionPage({ params }: { params: { id: string } }) {
  const session = sessions[params.id]

  if (!session) {
    notFound()
  }

  // Find previous and next sessions (mock)
  const prevSession = session.number > 1 ? { id: session.id - 1, number: session.number - 1 } : null
  const nextSession = null // Would check if next session exists

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
            <Icon icon="game-icons:arrow-scope" className="w-5 h-5 rotate-180" />
            <span>Todas as Sessões</span>
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
          <span className="text-slate-800">Sessão #{session.number}</span>
        </nav>
      </div>

      {/* Session Header */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg overflow-hidden">
          {/* Campaign Banner */}
          <div className="bg-[#0a1628] p-4">
            <div className="flex items-center gap-2">
              <Icon icon="game-icons:flag-objective" className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-cinzel">{session.campaign}</span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start gap-6">
              {/* Session Number */}
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="font-cinzel text-3xl text-white">#{session.number}</span>
              </div>

              {/* Title & Meta */}
              <div className="flex-grow">
                <h1 className="font-cinzel text-4xl text-slate-800 mb-2">
                  {session.title || `Sessão ${session.number}`}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Icon icon="game-icons:calendar" className="w-4 h-4" />
                    {new Date(session.realDate).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {session.inGameDate && (
                    <span className="flex items-center gap-1">
                      <Icon icon="game-icons:sundial" className="w-4 h-4" />
                      {session.inGameDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:scroll-quill" className="w-5 h-5 text-amber-600" />
                O que aconteceu
              </h2>
              <div className="font-crimson text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                {session.summary}
              </div>
            </div>

            {/* Key Events */}
            {session.keyEvents && session.keyEvents.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:crossed-swords" className="w-5 h-5 text-amber-600" />
                  Eventos Principais
                </h2>
                <ul className="space-y-3">
                  {session.keyEvents.map((event, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">
                        {i + 1}
                      </span>
                      <span className="font-crimson text-slate-700">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quotes */}
            {session.quotes && session.quotes.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:conversation" className="w-5 h-5 text-amber-600" />
                  Citações Memoráveis
                </h2>
                <div className="space-y-4">
                  {session.quotes.map((quote, i) => (
                    <blockquote key={i} className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/50 rounded-r-lg">
                      <p className="font-crimson text-slate-700 italic">{quote}</p>
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* Cliffhanger */}
            {session.cliffhanger && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-lg p-6 border-2 border-amber-300">
                <h2 className="font-cinzel text-xl text-slate-800 mb-3 flex items-center gap-2">
                  <Icon icon="game-icons:uncertainty" className="w-5 h-5 text-amber-600" />
                  Continua...
                </h2>
                <p className="font-crimson text-lg text-amber-800 italic">
                  {session.cliffhanger}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Characters Present */}
            {session.charactersPresent && session.charactersPresent.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-4">
                <h3 className="font-cinzel text-sm text-slate-600 mb-3 flex items-center gap-2">
                  <Icon icon="game-icons:cowled" className="w-4 h-4" />
                  Personagens Presentes
                </h3>
                <div className="space-y-2">
                  {session.charactersPresent.map((char, i) => (
                    <Link
                      key={i}
                      href={`/characters/${char.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-50 transition-colors group"
                    >
                      <Icon icon="game-icons:person" className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                      <span className="text-slate-700 group-hover:text-amber-700">{char}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {session.locationsVisited && session.locationsVisited.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-4">
                <h3 className="font-cinzel text-sm text-slate-600 mb-3 flex items-center gap-2">
                  <Icon icon="game-icons:castle" className="w-4 h-4" />
                  Locais Visitados
                </h3>
                <div className="space-y-2">
                  {session.locationsVisited.map((loc, i) => (
                    <Link
                      key={i}
                      href={`/places/${loc.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-amber-50 transition-colors group"
                    >
                      <Icon icon="game-icons:position-marker" className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                      <span className="text-slate-700 group-hover:text-amber-700">{loc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Items Found */}
            {session.itemsFound && session.itemsFound.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-4">
                <h3 className="font-cinzel text-sm text-slate-600 mb-3 flex items-center gap-2">
                  <Icon icon="game-icons:treasure-map" className="w-4 h-4" />
                  Itens Encontrados
                </h3>
                <div className="space-y-2">
                  {session.itemsFound.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50"
                    >
                      <Icon icon="game-icons:gem-chain" className="w-4 h-4 text-amber-600" />
                      <span className="text-slate-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          {prevSession ? (
            <Link
              href={`/sessions/${prevSession.id}`}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <Icon icon="game-icons:arrow-scope" className="w-5 h-5 rotate-180" />
              <span>Sessão #{prevSession.number}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextSession ? (
            <Link
              href={`/sessions/${(nextSession as any).id}`}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <span>Sessão #{(nextSession as any).number}</span>
              <Icon icon="game-icons:arrow-scope" className="w-5 h-5" />
            </Link>
          ) : (
            <div />
          )}
        </div>
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
