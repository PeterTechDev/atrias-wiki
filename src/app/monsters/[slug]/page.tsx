/**
 * Monster/Creature Detail Page
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import MechanicsToggle from '@/components/MechanicsToggle'

const monsters: Record<string, any> = {
  'djinns': {
    name: 'Djinns',
    type: 'Elemental',
    size: 'Grande',
    habitat: 'Planos Elementais',
    dangerLevel: 'Alto',
    description: 'Seres sobrenaturais dos planos elementais que possuem vasto conhecimento e poder.',
    appearance: 'Os Djinns variam em aparência conforme seu elemento de origem. Djinns de fogo brilham com chamas internas, enquanto os de ar são quase etéreos. Todos compartilham uma presença imponente e olhos que parecem conter o infinito.',
    behavior: 'Djinns são seres orgulhosos e antigos. Eles raramente se preocupam com assuntos mortais, mas podem ser atraídos por demonstrações de poder ou sabedoria. Não devem ser invocados levianamente.',
    abilities: [
      'Manipulação elemental de seu tipo',
      'Imunidade a dano de seu elemento',
      'Capacidade de conceder desejos (com consequências)',
      'Teleporte entre planos',
      'Vida extremamente longa',
    ],
    weaknesses: [
      'Vulneráveis ao elemento oposto',
      'Podem ser presos em recipientes mágicos',
      'Pactos feitos com mortais os vinculam',
    ],
    lore: 'Amergin Ghalbath passou anos estudando com os Djinns durante sua jornada. Ele registrou que são criaturas de imenso poder, mas também de grande sabedoria. Segundo seus escritos, os Djinns veem o mundo mortal como efêmero demais para se preocupar, mas ocasionalmente encontram mortais dignos de sua atenção.',
    encounters: 'Encontros com Djinns são raros no mundo material. Quando ocorrem, geralmente envolvem magos poderosos tentando convocá-los ou viajantes acidentais nos Planos Elementais.',
    // D&D mechanics (hidden by default)
    stats: {
      ac: '17 (armadura natural)',
      hp: '161 (14d10 + 84)',
      speed: '9m, voo 27m',
      cr: '11 (7.200 XP)',
    },
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
  },
  'lobisomem-de-vellenor': {
    name: 'Lobisomem de Vellenor',
    type: 'Metamorfo',
    size: 'Médio/Grande',
    habitat: 'Florestas de Vellenor',
    dangerLevel: 'Alto',
    description: 'Criaturas amaldiçoadas que vagam pelas densas florestas, atacando viajantes nas noites de lua cheia.',
    appearance: 'Em forma híbrida, combinam características humanas e lupinas. Pelos grossos cobrem corpos musculosos, garras afiadas, e olhos que brilham com ferocidade animal. Alguns mantêm vestígios de suas roupas de quando eram humanos.',
    behavior: 'Durante a lua cheia, perdem o controle sobre seus instintos predatórios. Fora desse período, muitos tentam viver vidas normais, escondendo sua maldição. Alguns abraçam a fera interior e caçam por prazer.',
    abilities: [
      'Transformação em lobo ou forma híbrida',
      'Força e velocidade sobre-humanas',
      'Sentidos aguçados',
      'Regeneração (exceto por prata)',
      'Transmissão da licantropia por mordida',
    ],
    weaknesses: [
      'Prata causa dano agravado',
      'Acônito (wolfsbane) é venenoso',
      'Vulneráveis quando em forma humana',
      'A transformação é dolorosa e exaustiva',
    ],
    lore: 'A maldição da licantropia em Vellenor data de séculos, quando uma bruxa amaldiçoou um lorde cruel. A maldição se espalhou por suas terras, e até hoje as florestas de Vellenor são conhecidas por seus lobisomens.',
    encounters: 'Viajantes são aconselhados a evitar as florestas de Vellenor durante a lua cheia. Aqueles que devem passar são instruídos a carregar prata e acônito.',
    stats: {
      ac: '12 (forma híbrida)',
      hp: '58 (9d8 + 18)',
      speed: '12m (forma híbrida)',
      cr: '3 (700 XP)',
    },
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
  },
  'golem-de-pedra': {
    name: 'Golem de Pedra',
    type: 'Construto',
    size: 'Grande',
    habitat: 'Ruínas Antigas',
    dangerLevel: 'Médio',
    description: 'Guardiões de pedra animados por magia antiga, protegendo locais de grande importância.',
    appearance: 'Humanoides massivos esculpidos em pedra bruta ou mármore. Suas formas variam - alguns parecem guerreiros, outros figuras abstratas. Runas mágicas frequentemente adornam seus corpos, brilhando quando ativados.',
    behavior: 'Golems seguem instruções literalmente e sem questionamento. Protegem seu território designado até serem destruídos. Não possuem inteligência verdadeira, apenas programação mágica.',
    abilities: [
      'Força imensa',
      'Imunidade a magia de baixo nível',
      'Não precisa respirar, comer ou dormir',
      'Resistência a dano físico',
      'Incansável em combate',
    ],
    weaknesses: [
      'Lento e previsível',
      'Não pode ser raciocinado ou enganado',
      'Vulnerável a certos tipos de magia',
      'Destruir as runas de controle os desativa',
    ],
    lore: 'Golems de pedra eram comumente criados nas eras antigas para proteger tesouros e locais sagrados. Muitos ainda permanecem em ruínas esquecidas, aguardando visitantes indesejados.',
    stats: {
      ac: '17 (armadura natural)',
      hp: '178 (17d10 + 85)',
      speed: '9m',
      cr: '10 (5.900 XP)',
    },
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
    encounters: 'Aventureiros frequentemente encontram golems em masmorras e ruínas. A chave é identificar e neutralizar suas runas de controle.',
  },
  'serpente-marinha': {
    name: 'Serpente Marinha',
    type: 'Besta',
    size: 'Colossal',
    habitat: 'Mar do Meio',
    dangerLevel: 'Extremo',
    description: 'Criaturas colossais que habitam as profundezas, temidas por todos os marinheiros.',
    appearance: 'Serpentes de proporções inimagináveis, algumas chegando a centenas de metros de comprimento. Escamas iridescentes, olhos do tamanho de barcos, e mandíbulas capazes de partir navios ao meio.',
    behavior: 'Geralmente habitam as profundezas, subindo à superfície para caçar ou durante tempestades. Extremamente territoriais - navios que invadem seus domínios raramente retornam.',
    abilities: [
      'Tamanho colossal',
      'Capacidade de destruir navios',
      'Pode criar redemoinhos',
      'Visão adaptada às profundezas',
      'Pele resistente a armas comuns',
    ],
    weaknesses: [
      'Vulnerável na superfície',
      'Luz intensa pode cegá-las temporariamente',
      'Magia relâmpago é eficaz',
      'Pontos fracos nas guelras',
    ],
    lore: 'Marinheiros contam histórias de serpentes marinhas desde tempos imemoriais. Algumas lendas dizem que são criaturas primordiais que existem desde antes dos deuses, outras que são guardiãs de tesouros submersos.',
    encounters: 'Capitães experientes conhecem as rotas que evitam territórios de serpentes. Os tolos que ignoram esse conhecimento raramente vivem para contar a história.',
  },
}

const dangerColors: Record<string, string> = {
  'Baixo': 'bg-green-600/20 text-green-400',
  'Médio': 'bg-yellow-600/20 text-yellow-400',
  'Alto': 'bg-orange-600/20 text-orange-400',
  'Extremo': 'bg-red-600/30 text-red-400',
}

export function generateStaticParams() {
  return Object.keys(monsters).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MonsterPage({ params }: PageProps) {
  const { slug } = await params
  const monster = monsters[slug]

  if (!monster) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Criatura não encontrada</h1>
          <Link href="/monsters" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Bestiário
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
          <Link href="/monsters" className="hover:text-amber-700">Bestiário</Link>
          <span>›</span>
          <span className="text-slate-800">{monster.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:spiked-dragon-head" className="w-10 h-10 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">{monster.type}</span>
                <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{monster.size}</span>
                <span className={`text-xs px-2 py-1 rounded ${dangerColors[monster.dangerLevel]}`}>
                  ⚠ Perigo: {monster.dangerLevel}
                </span>
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{monster.name}</h1>
              <p className="text-slate-300 font-crimson text-lg italic">{monster.description}</p>
              <p className="text-slate-400 text-sm mt-2">
                <Icon icon="game-icons:compass" className="w-4 h-4 inline mr-1" />
                Habitat: {monster.habitat}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:eye-monster" className="w-6 h-6 text-amber-700" />
                Aparência
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{monster.appearance}</p>
            </section>

            {/* Behavior */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:brain" className="w-6 h-6 text-amber-700" />
                Comportamento
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{monster.behavior}</p>
            </section>

            {/* Lore */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                Lore
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{monster.lore}</p>
            </section>

            {/* Encounters */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:crossed-swords" className="w-6 h-6 text-amber-700" />
                Encontros
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{monster.encounters}</p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Combat Info (Hidden by default) */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <MechanicsToggle title="Informações de Combate">
                <div className="space-y-6">
                  {/* Abilities */}
                  <div>
                    <h4 className="font-cinzel text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <Icon icon="game-icons:burning-meteor" className="w-4 h-4 text-red-600" />
                      Habilidades
                    </h4>
                    <ul className="space-y-1">
                      {monster.abilities.map((ability: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <Icon icon="game-icons:check-mark" className="w-3 h-3 text-red-500 flex-shrink-0 mt-1" />
                          {ability}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="font-cinzel text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <Icon icon="game-icons:broken-shield" className="w-4 h-4 text-green-600" />
                      Fraquezas
                    </h4>
                    <ul className="space-y-1">
                      {monster.weaknesses.map((weakness: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <Icon icon="game-icons:target-dummy" className="w-3 h-3 text-green-500 flex-shrink-0 mt-1" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stats */}
                  {monster.stats && (
                    <div>
                      <h4 className="font-cinzel text-sm text-slate-800 mb-2 flex items-center gap-2">
                        <Icon icon="game-icons:dice-twenty-faces-twenty" className="w-4 h-4 text-purple-600" />
                        Ficha de Combate
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">CA:</span>
                          <span className="ml-2 font-mono text-slate-800">{monster.stats.ac}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">PV:</span>
                          <span className="ml-2 font-mono text-slate-800">{monster.stats.hp}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Velocidade:</span>
                          <span className="ml-2 font-mono text-slate-800">{monster.stats.speed}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">ND:</span>
                          <span className="ml-2 font-mono text-slate-800">{monster.stats.cr}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </MechanicsToggle>
            </div>
          </div>
        </div>

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Adicionado por:</span>
            <span className="text-slate-700 font-medium">{monster.contributor || 'Dungeon Master'}</span>
          </div>
          {monster.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {monster.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Conhecer seu inimigo é o primeiro passo para sobreviver."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
