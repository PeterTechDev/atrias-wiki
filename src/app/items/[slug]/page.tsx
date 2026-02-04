/**
 * Item Detail Page
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import MechanicsToggle from '@/components/MechanicsToggle'

const items: Record<string, any> = {
  'espada-do-juramento': {
    name: 'Espada do Juramento',
    type: 'Arma',
    subtype: 'Espada Longa',
    rarity: 'Raro',
    attunement: true,
    description: 'Uma lâmina sagrada empunhada pelos paladinos da Chama Branca, brilha com luz divina quando empunhada por um coração puro.',
    history: 'Forjada nos templos da Chama Branca durante a Era das Guerras Sagradas, esta espada foi abençoada por sete sumos sacerdotes em uma cerimônia que durou sete dias e sete noites.',
    // Lore-friendly descriptions (shown by default)
    traits: [
      'A lâmina é notavelmente mais afiada e resistente que uma espada comum',
      'Emana uma luz dourada quando empunhada por um coração justo',
      'Queima os mortos-vivos com chamas sagradas ao menor toque',
    ],
    // Mechanical properties (hidden behind toggle)
    mechanics: [
      '+1 em jogadas de ataque e dano',
      'Emite luz brilhante em um raio de 3m quando empunhada',
      'Dano adicional de 1d6 radiante contra mortos-vivos',
    ],
    lore: 'Diz a lenda que apenas aqueles verdadeiramente dedicados à justiça podem despertar todo o poder desta lâmina. Muitos a empunharam, mas poucos viram sua luz verdadeira.',
    location: 'Desconhecido - última vez vista em Solaria',
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
    previousOwners: ['Cavaleiro Vaelor', 'Ordem do Cálice'],
  },
  'godsack': {
    name: 'Godsack',
    type: 'Equipamento',
    subtype: 'Mochila',
    rarity: 'Comum',
    attunement: false,
    description: 'Uma mochila feita de palha trançada e couro, usada pelos Carregadores para armazenar bolas durante a Contenda do Couro.',
    history: 'Item tradicional usado nos jogos da Contenda do Couro, uma competição esportiva popular em várias regiões de Átrias.',
    traits: [
      'Feita com couro resistente e palha trançada, suporta uso intenso',
      'Permite acesso rápido ao conteúdo durante jogos',
    ],
    mechanics: [
      'Pode carregar até 10 bolas de couro',
      'Acesso rápido para arremesso',
    ],
    lore: 'O nome curioso vem de uma antiga expressão local que significa "bolsa sagrada do jogo".',
    location: 'Comum em cidades que praticam a Contenda',
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
    previousOwners: [],
  },
  'fundas': {
    name: 'Fundas',
    type: 'Arma',
    subtype: 'Arma de Arremesso',
    rarity: 'Comum',
    attunement: false,
    description: 'Estilingues usados pelos Baleiros para atacar oponentes e ânforas durante os jogos.',
    history: 'Ferramentas simples mas eficazes, as fundas são parte integral da Contenda do Couro.',
    traits: [
      'Simples de usar, mas requer prática para dominar',
      'Capaz de acertar alvos a distâncias consideráveis',
    ],
    mechanics: [
      'Alcance: 9/36m',
      'Dano: 1d4 contundente',
    ],
    lore: 'Os melhores Baleiros são conhecidos por sua precisão impressionante, capazes de acertar ânforas em movimento a grandes distâncias.',
    location: 'Comum em toda Átrias',
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
    previousOwners: [],
  },
  'amuleto-de-ghalbath': {
    name: 'Amuleto de Ghalbath',
    type: 'Acessório',
    subtype: 'Amuleto',
    rarity: 'Lendário',
    attunement: true,
    description: 'Um amuleto antigo que permite ao portador sentir as correntes elementais do mundo.',
    history: 'Criado pelo próprio Amergin Ghalbath durante sua jornada pelos planos elementais, este amuleto contém fragmentos de cada plano que ele visitou.',
    traits: [
      'Protege seu portador contra os elementos naturais',
      'Pulsa quando criaturas elementais estão próximas',
      'Permite invocar uma barreira protetora contra energia',
    ],
    mechanics: [
      'Resistência a dano elemental (fogo, gelo, raio, ácido)',
      'Pode detectar criaturas elementais em 18m',
      'Uma vez por dia, pode conjurar Proteção contra Energia',
    ],
    lore: 'O amuleto pulsa com energia elemental, mudando sutilmente de cor conforme as correntes mágicas do ambiente. Dizem que seu verdadeiro poder só é revelado a quem completa a mesma jornada espiritual de Ghalbath.',
    location: 'Guardado pela Ordem de Ghalbath',
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
    previousOwners: ['Amergin Ghalbath'],
  },
}

const rarityColors: Record<string, string> = {
  'Comum': 'bg-slate-600/20 text-slate-400',
  'Incomum': 'bg-green-600/20 text-green-400',
  'Raro': 'bg-blue-600/20 text-blue-400',
  'Épico': 'bg-purple-600/20 text-purple-400',
  'Lendário': 'bg-amber-600/30 text-amber-400',
}

export function generateStaticParams() {
  return Object.keys(items).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params
  const item = items[slug]

  if (!item) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Item não encontrado</h1>
          <Link href="/items" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Itens
          </Link>
        </div>
      </main>
    )
  }

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
          <Link href="/items" className="hover:text-amber-700">Itens</Link>
          <span>›</span>
          <span className="text-slate-800">{item.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:swap-bag" className="w-10 h-10 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded">{item.type}</span>
                <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{item.subtype}</span>
                <span className={`text-xs px-2 py-1 rounded ${rarityColors[item.rarity]}`}>{item.rarity}</span>
                {item.attunement && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Requer Sintonização</span>
                )}
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{item.name}</h1>
              <p className="text-slate-300 font-crimson text-lg italic">{item.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traits (Lore-friendly) */}
            {item.traits && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:sparkles" className="w-6 h-6 text-amber-700" />
                  Características
                </h2>
                <ul className="space-y-2">
                  {item.traits.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Icon icon="game-icons:check-mark" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="font-crimson">{t}</span>
                    </li>
                  ))}
                </ul>

                {/* Mechanics Toggle */}
                {item.mechanics && (
                  <MechanicsToggle>
                    <ul className="space-y-2">
                      {item.mechanics.map((m: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                          <Icon icon="game-icons:dice-six-faces-six" className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                          <span className="font-mono">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </MechanicsToggle>
                )}
              </section>
            )}

            {/* History */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                História
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{item.history}</p>
            </section>

            {/* Lore */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:book-aura" className="w-6 h-6 text-amber-700" />
                Lore
              </h2>
              <p className="text-slate-600 font-crimson italic border-l-4 border-amber-600 pl-4">
                {item.lore}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Informações</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Localização Conhecida</dt>
                  <dd className="text-slate-800 font-medium">{item.location}</dd>
                </div>
                {item.previousOwners.length > 0 && (
                  <div>
                    <dt className="text-slate-500">Donos Anteriores</dt>
                    <dd className="mt-1 space-y-1">
                      {item.previousOwners.map((o: string) => (
                        <div key={o} className="flex items-center gap-2 text-slate-700">
                          <Icon icon="game-icons:cowled" className="w-4 h-4 text-amber-600" />
                          {o}
                        </div>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Adicionado por:</span>
            <span className="text-slate-700 font-medium">{item.contributor || 'Dungeon Master'}</span>
          </div>
          {item.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {item.lastUpdated}
            </div>
          )}
        </div>
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
