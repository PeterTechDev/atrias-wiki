/**
 * Items listing page
 * Magical artifacts, weapons, and treasures of Átrias
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

// Mocked items data from entities.json
const items = [
  {
    slug: 'espada-do-juramento',
    name: 'Espada do Juramento',
    type: 'Arma',
    rarity: 'Raro',
    description: 'Uma lâmina sagrada empunhada pelos paladinos da Chama Branca, brilha com luz divina quando empunhada por um coração puro.',
  },
  {
    slug: 'godsack',
    name: 'Godsack',
    type: 'Equipamento',
    rarity: 'Comum',
    description: 'Uma mochila feita de palha trançada e couro, usada pelos Carregadores para armazenar bolas durante a Contenda do Couro.',
  },
  {
    slug: 'fundas',
    name: 'Fundas',
    type: 'Arma',
    rarity: 'Comum',
    description: 'Estilingues usados pelos Baleiros para atacar oponentes e ânforas durante os jogos.',
  },
  {
    slug: 'amuleto-de-ghalbath',
    name: 'Amuleto de Ghalbath',
    type: 'Acessório',
    rarity: 'Lendário',
    description: 'Um amuleto antigo que permite ao portador sentir as correntes elementais do mundo.',
  },
]

const rarityColors: Record<string, string> = {
  'Comum': 'bg-slate-600/20 text-slate-400',
  'Incomum': 'bg-green-600/20 text-green-400',
  'Raro': 'bg-blue-600/20 text-blue-400',
  'Épico': 'bg-purple-600/20 text-purple-400',
  'Lendário': 'bg-amber-600/20 text-amber-400',
}

export default function ItemsPage() {
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
              <p className="text-slate-600 font-crimson italic">Artefatos, armas e tesouros mágicos</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Explore os itens lendários de Átrias. De armas encantadas a relíquias antigas,
            cada objeto carrega poder e história em igual medida.
          </p>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:locked-chest" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhum item encontrado</p>
            <p className="text-slate-500 mt-2">Os itens serão adicionados em breve.</p>
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
                    {item.description}
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
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Todo artefato carrega a história daqueles que o empunharam."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
