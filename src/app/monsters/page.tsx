/**
 * Bestiary listing page
 * Creatures and monsters of Atrias
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import type { MonsterData } from '@/types/entities'

const dangerColors: Record<string, string> = {
  'Baixo': 'bg-green-600/20 text-green-400',
  'Medio': 'bg-yellow-600/20 text-yellow-400',
  'Alto': 'bg-orange-600/20 text-orange-400',
  'Extremo': 'bg-red-600/20 text-red-400',
}

const typeIcons: Record<string, string> = {
  'Elemental': 'game-icons:fire-ring',
  'Metamorfo': 'game-icons:werewolf',
  'Construto': 'game-icons:stone-golem',
  'Besta': 'game-icons:sea-serpent',
  'Morto-vivo': 'game-icons:skull-crossed-bones',
  'Aberracao': 'game-icons:tentacles-skull',
  'Dragao': 'game-icons:spiked-dragon-head',
}

export default async function MonstersPage() {
  const entities = await getEntitiesByType('monster')

  const monsters = entities.map((e) => {
    const data = e.data as MonsterData
    return {
      slug: e.slug,
      name: e.name,
      type: data.type || 'Criatura',
      habitat: data.environment?.[0] || '',
      dangerLevel: '',
      description: e.description || '',
    }
  })

  return (
    <main className="min-h-screen flex flex-col bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ATRIAS</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <span className="text-slate-800">Bestiario</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:spiked-dragon-head" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Bestiario</h1>
              <p className="text-slate-600 font-crimson italic">Criaturas e monstros que habitam o mundo</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Conheca as criaturas que espreitam nas sombras de Atrias. De elementais ancestrais a bestas ferozes,
            este compendio documenta os perigos que aguardam os incautos.
          </p>
        </div>
      </div>

      {/* Monsters Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {monsters.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:bat" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhuma criatura encontrada</p>
            <p className="text-slate-500 mt-2">O bestiario sera preenchido em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monsters.map((monster) => (
              <Link
                key={monster.slug}
                href={`/monsters/${monster.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded flex items-center gap-1">
                      <Icon icon={typeIcons[monster.type] || 'game-icons:daemon-skull'} className="w-3 h-3" />
                      {monster.type}
                    </span>
                    {monster.dangerLevel && (
                      <span className={`text-xs px-2 py-1 rounded ${dangerColors[monster.dangerLevel] || dangerColors['Medio']}`}>
                        \u26A0 {monster.dangerLevel}
                      </span>
                    )}
                  </div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {monster.name}
                  </h2>
                  {monster.habitat && (
                    <p className="text-slate-400 text-xs mt-1">Habitat: {monster.habitat}</p>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-slate-600 text-sm font-crimson line-clamp-3">
                    {monster.description || 'Uma criatura misteriosa aguardando para ser documentada.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <span className="text-amber-700 text-sm font-medium group-hover:text-amber-600 flex items-center gap-1">
                    Ver detalhes
                    <Icon icon="game-icons:fangs" className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Conhecer seu inimigo e o primeiro passo para sobreviver."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
