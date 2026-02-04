/**
 * Factions listing page
 * Organizations, guilds, and groups of Átrias
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

// Mocked factions data from entities.json
const factions = [
  {
    slug: 'chama-branca',
    name: 'Chama Branca',
    type: 'Religião',
    alignment: 'Leal Bom',
    description: 'Uma fé dedicada à justiça e ordem, simbolizando pureza e radiância.',
  },
  {
    slug: 'alta-arcanas',
    name: "Alta'Arcanas",
    type: 'Organização Mágica',
    alignment: 'Neutro',
    description: 'Organização fundada por Khay\'zam para conter e disseminar conhecimento mágico, monitorando seu uso para prevenir catástrofes.',
  },
  {
    slug: 'cacadores-de-sangue',
    name: 'Caçadores de Sangue',
    type: 'Força Marcial',
    alignment: 'Leal Neutro',
    description: 'Uma força marcial treinada para controlar usuários de magia renegados e manter a integridade da Alta\'Arcanas.',
  },
  {
    slug: 'ordem-de-ghalbath',
    name: 'Ordem de Ghalbath',
    type: 'Ordem Mística',
    alignment: 'Neutro Bom',
    description: 'Uma antiga ordem dedicada aos ensinamentos de Amergin Ghalbath, guardando segredos elementais.',
  },
]

export default function FactionsPage() {
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
          <span className="text-slate-800">Facções</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:rally-the-troops" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Facções</h1>
              <p className="text-slate-600 font-crimson italic">Ordens, guildas e organizações do mundo</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Descubra as organizações que moldam o destino de Átrias. De ordens sagradas a guildas secretas,
            cada facção carrega seus próprios ideais e objetivos neste mundo em constante conflito.
          </p>
        </div>
      </div>

      {/* Factions Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {factions.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:flag" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhuma facção encontrada</p>
            <p className="text-slate-500 mt-2">As facções serão adicionadas em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {factions.map((faction) => (
              <Link 
                key={faction.slug} 
                href={`/factions/${faction.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                      {faction.type}
                    </span>
                    <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">
                      {faction.alignment}
                    </span>
                  </div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {faction.name}
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-slate-600 text-sm font-crimson line-clamp-3">
                    {faction.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <span className="text-amber-700 text-sm font-medium group-hover:text-amber-600 flex items-center gap-1">
                    Ver detalhes
                    <Icon icon="game-icons:scroll-unfurled" className="w-4 h-4" />
                  </span>
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
            "Lealdade é a moeda mais valiosa entre aqueles que servem a uma causa maior."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
