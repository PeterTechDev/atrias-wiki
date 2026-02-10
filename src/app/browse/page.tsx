/**
 * General browse page — gateway to all wiki content
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { db } from '@/db'
import { entities } from '@/db/schema'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const categories = [
  { type: 'character', label: 'Personagens', href: '/characters', icon: 'game-icons:person', description: 'Heróis, vilões e figuras notáveis de Átrias' },
  { type: 'place', label: 'Lugares', href: '/places', icon: 'game-icons:castle', description: 'Cidades, reinos, florestas e ruínas' },
  { type: 'faction', label: 'Facções', href: '/factions', icon: 'game-icons:flag-objective', description: 'Ordens, guildas e organizações' },
  { type: 'item', label: 'Itens', href: '/items', icon: 'game-icons:crossed-swords', description: 'Armas, relíquias e artefatos' },
  { type: 'lore', label: 'Conhecimento', href: '/lore', icon: 'game-icons:scroll-unfurled', description: 'Histórias, mitos e sabedoria antiga' },
  { type: 'monster', label: 'Criaturas', href: '/monsters', icon: 'game-icons:spiked-dragon-head', description: 'Bestas e monstros que espreitam Átrias' },
]

const extras = [
  { label: 'Sessões', href: '/sessions', icon: 'game-icons:quill-ink', description: 'Crônicas das aventuras registradas por Thaveus' },
  { label: 'Mapa', href: '/map', icon: 'game-icons:treasure-map', description: 'O mapa do mundo de Átrias' },
]

export default async function BrowsePage() {
  // Get counts per type
  const counts = await db
    .select({ type: entities.type, count: sql<number>`count(*)` })
    .from(entities)
    .groupBy(entities.type)

  const countMap: Record<string, number> = {}
  for (const row of counts) {
    countMap[row.type] = Number(row.count)
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <span className="text-slate-800">Arquivos</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4">
            <Icon icon="game-icons:book-pile" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Arquivos de Átrias</h1>
              <p className="text-slate-600 font-crimson italic">Tudo que foi registrado pelo Escriba</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Categories */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.type}
              href={cat.href}
              className="group bg-white/80 rounded-lg shadow-lg p-6 border border-amber-200 hover:border-amber-400 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 rounded-lg p-3">
                  <Icon icon={cat.icon} className="w-8 h-8 text-amber-800" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-cinzel text-xl text-slate-800 group-hover:text-amber-800 transition-colors">
                      {cat.label}
                    </h2>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-semibold">
                      {countMap[cat.type] || 0}
                    </span>
                  </div>
                  <p className="text-slate-600 font-crimson text-sm mt-1">{cat.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Extra sections */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          {extras.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-[#0a1628] rounded-lg shadow-lg p-6 border border-amber-400/20 hover:border-amber-400/50 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <Icon icon={item.icon} className="w-8 h-8 text-amber-400" />
                <div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {item.label}
                  </h2>
                  <p className="text-slate-400 font-crimson text-sm mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            &quot;Cada entrada é uma página no Livro das Estórias Não Contadas.&quot;
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
