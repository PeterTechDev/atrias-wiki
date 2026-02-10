/**
 * Items listing page
 * Magical artifacts, weapons, and treasures of Atrias
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import type { ItemData } from '@/types/entities'

const rarityColors: Record<string, string> = {
  'Comum': 'bg-slate-600/20 text-slate-400',
  'Incomum': 'bg-green-600/20 text-green-400',
  'Raro': 'bg-blue-600/20 text-blue-400',
  'Epico': 'bg-purple-600/20 text-purple-400',
  'Lendario': 'bg-amber-600/20 text-amber-400',
}

export default async function ItemsPage() {
  const entities = await getEntitiesByType('item')

  const items = entities.map((e) => {
    const data = e.data as ItemData
    return {
      slug: e.slug,
      name: e.name,
      type: data.type || 'Item',
      rarity: data.rarity || 'Comum',
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
          <span className="text-slate-800">Itens</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:swap-bag" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Itens</h1>
              <p className="text-slate-600 font-crimson italic">Artefatos, armas e tesouros magicos</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Explore os itens lendarios de Atrias. De armas encantadas a reliquias antigas,
            cada objeto carrega poder e historia em igual medida.
          </p>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:locked-chest" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhum item encontrado</p>
            <p className="text-slate-500 mt-2">Os itens serao adicionados em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/items/${item.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded">
                      {item.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${rarityColors[item.rarity] || rarityColors['Comum']}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-slate-600 text-sm font-crimson line-clamp-3">
                    {item.description || 'Um item misterioso aguardando para ser descoberto.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <span className="text-amber-700 text-sm font-medium group-hover:text-amber-600 flex items-center gap-1">
                    Examinar item
                    <Icon icon="game-icons:magnifying-glass" className="w-4 h-4" />
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
            "Todo artefato carrega a historia daqueles que o empunharam."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
