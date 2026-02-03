/**
 * Demo page - Shows what the wiki looks like with real data
 * No Sanity needed - uses extracted data directly
 */

import Link from 'next/link'
import * as fs from 'fs'
import * as path from 'path'

// Load extracted entities at build time
function getEntities() {
  try {
    const data = fs.readFileSync(
      path.join(process.cwd(), 'import-output/entities.json'),
      'utf-8'
    )
    return JSON.parse(data)
  } catch {
    return []
  }
}

export default function DemoPage() {
  const entities = getEntities()
  
  const characters = entities.filter((e: any) => e.type === 'character').slice(0, 8)
  const places = entities.filter((e: any) => e.type === 'place').slice(0, 6)
  const factions = entities.filter((e: any) => e.type === 'faction').slice(0, 6)
  const items = entities.filter((e: any) => e.type === 'item').slice(0, 6)
  const lore = entities.filter((e: any) => e.type === 'lore').slice(0, 4)

  const stats = {
    characters: entities.filter((e: any) => e.type === 'character').length,
    places: entities.filter((e: any) => e.type === 'place').length,
    factions: entities.filter((e: any) => e.type === 'faction').length,
    items: entities.filter((e: any) => e.type === 'item').length,
    lore: entities.filter((e: any) => e.type === 'lore').length,
    monsters: entities.filter((e: any) => e.type === 'monster').length,
  }
  const total = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-red-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-4">
            Átrias Wiki
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Seu guia completo para o mundo de Átrias — cenário original de D&D 
            com milhares de anos de história, magia e aventura
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="bg-zinc-800/50 px-4 py-2 rounded-full">
              <span className="text-amber-400 font-bold">{total}</span>
              <span className="text-zinc-400 ml-1">entradas</span>
            </div>
            <div className="bg-zinc-800/50 px-4 py-2 rounded-full">
              <span className="text-green-400 font-bold">7</span>
              <span className="text-zinc-400 ml-1">continentes</span>
            </div>
            <div className="bg-zinc-800/50 px-4 py-2 rounded-full">
              <span className="text-red-400 font-bold">∞</span>
              <span className="text-zinc-400 ml-1">aventuras</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: '👤', label: 'Personagens', count: stats.characters, color: 'amber' },
            { icon: '🗺️', label: 'Lugares', count: stats.places, color: 'green' },
            { icon: '⚔️', label: 'Facções', count: stats.factions, color: 'red' },
            { icon: '🗡️', label: 'Itens', count: stats.items, color: 'purple' },
            { icon: '📜', label: 'Lore', count: stats.lore, color: 'yellow' },
            { icon: '👹', label: 'Monstros', count: stats.monsters, color: 'pink' },
          ].map((cat) => (
            <div
              key={cat.label}
              className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 text-center hover:bg-zinc-800/50 hover:border-zinc-600 transition-all cursor-pointer group"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-medium text-zinc-300">{cat.label}</span>
              <span className="block text-xs text-zinc-500 mt-1">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Characters Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            👤 Personagens
          </h2>
          <span className="text-zinc-500 text-sm">Ver todos →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {characters.map((char: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-amber-500/30 transition-all group"
            >
              <h3 className="font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">
                {char.name}
              </h3>
              {char.description && (
                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                  {char.description}
                </p>
              )}
              {char.mentions?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {char.mentions.slice(0, 2).map((m: string, j: number) => (
                    <span key={j} className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Places Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
            🗺️ Lugares
          </h2>
          <span className="text-zinc-500 text-sm">Ver todos →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-green-500/30 transition-all"
            >
              <h3 className="font-semibold text-green-300">{place.name}</h3>
              {place.description && (
                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                  {place.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Factions Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            ⚔️ Facções & Organizações
          </h2>
          <span className="text-zinc-500 text-sm">Ver todos →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factions.map((faction: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-red-500/30 transition-all flex gap-4"
            >
              <div className="text-3xl">⚔️</div>
              <div>
                <h3 className="font-semibold text-red-300">{faction.name}</h3>
                {faction.description && (
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                    {faction.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lore Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            📜 Lore & História
          </h2>
          <span className="text-zinc-500 text-sm">Ver todos →</span>
        </div>
        <div className="space-y-3">
          {lore.map((entry: any, i: number) => (
            <div
              key={i}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 hover:border-yellow-500/30 transition-all"
            >
              <h3 className="font-semibold text-yellow-300">{entry.name}</h3>
              {entry.description && (
                <p className="text-zinc-400 text-sm mt-2">
                  {entry.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">
            Átrias Wiki — Um cenário de campanha de D&D
          </p>
          <p className="text-zinc-600 text-xs mt-2">
            Built with Next.js + Sanity • AI-powered content extraction
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/studio" className="text-amber-400 hover:text-amber-300 text-sm">
              📝 Editar Wiki
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-zinc-300 text-sm">
              🏠 Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
