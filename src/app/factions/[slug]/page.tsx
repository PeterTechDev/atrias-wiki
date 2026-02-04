/**
 * Faction Detail Page
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

const factions: Record<string, any> = {
  'chama-branca': {
    name: 'Chama Branca',
    type: 'Religião',
    alignment: 'Leal Bom, Leal Neutro',
    description: 'Uma fé dedicada à justiça e ordem, simbolizando pureza e radiância.',
    domains: ['Justiça', 'Ordem', 'Luz'],
    portfolio: ['Justiça', 'Redenção', 'Tribunal', 'Acerto de Contas'],
    dogma: [
      'Revele a verdade, puna os culpados, corrija o erro e seja sempre verdadeiro e justo em suas ações.',
      'A ordem é o caminho que trilhamos em comunhão para promover o bem-estar de todos.'
    ],
    proverbs: [
      'A verdade ilumina o caminho, mas a justiça é a luz que guia nossos passos.',
      'Onde há ordem, a paz prospera; onde há paz, a justiça se estabelece.',
      'O bem comum é uma chama que se alimenta do serviço e da solidariedade.',
      'Em cada ato de justiça, a luz da Chama Branca brilha mais intensamente.',
    ],
    members: [
      { name: 'Idris Rucandel', role: 'Paladino' },
    ],
    headquarters: 'Diversas capelas e templos por Nerania',
    history: 'A Chama Branca é uma das fés mais antigas de Átrias, dedicada a manter a ordem e promover a justiça. Seus seguidores acreditam que a verdade é a maior arma contra a corrupção e que cada ato de justiça fortalece a luz no mundo.',
  },
  'alta-arcanas': {
    name: "Alta'Arcanas",
    type: 'Organização Mágica',
    alignment: 'Neutro',
    description: 'Organização fundada por Khay\'zam para conter e disseminar conhecimento mágico.',
    domains: ['Magia', 'Conhecimento', 'Controle'],
    portfolio: ['Educação Arcana', 'Regulamentação Mágica', 'Pesquisa'],
    dogma: [
      'O conhecimento mágico deve ser preservado, mas controlado.',
      'Aqueles que abusam da magia devem ser contidos.'
    ],
    members: [],
    headquarters: 'Torres Arcanas em várias cidades',
    history: 'Após a Grande Destruição, Khay\'zam fundou a Alta\'Arcanas para garantir que a magia nunca mais causasse tamanha devastação. A organização monitora o uso de magia e treina novos magos dentro de diretrizes rígidas.',
  },
  'cacadores-de-sangue': {
    name: 'Caçadores de Sangue',
    type: 'Força Marcial',
    alignment: 'Leal Neutro',
    description: 'Uma força marcial treinada para controlar usuários de magia renegados.',
    domains: ['Caça', 'Combate Anti-Magia', 'Execução'],
    portfolio: ['Captura de Renegados', 'Proteção Civil', 'Investigação'],
    dogma: [
      'A magia descontrolada é uma ameaça a todos.',
      'Não há piedade para aqueles que corrompem o dom arcano.'
    ],
    members: [],
    headquarters: 'Fortaleza em local secreto',
    history: 'Os Caçadores de Sangue são o braço armado da Alta\'Arcanas. Treinados desde jovens para resistir e combater magia, eles são temidos por magos renegados em todo o continente.',
  },
  'ordem-de-ghalbath': {
    name: 'Ordem de Ghalbath',
    type: 'Ordem Mística',
    alignment: 'Neutro Bom',
    description: 'Uma antiga ordem dedicada aos ensinamentos de Amergin Ghalbath.',
    domains: ['Elementos', 'Equilíbrio', 'Sabedoria'],
    portfolio: ['Harmonia Elemental', 'Meditação', 'Jornada Espiritual'],
    dogma: [
      'Os elementos são a base de toda existência.',
      'Busque o equilíbrio em todas as coisas.'
    ],
    members: [],
    headquarters: 'Monastério nas Montanhas',
    history: 'Fundada pelos discípulos de Amergin Ghalbath após sua jornada pelos planos elementais, a ordem preserva seus ensinamentos sobre a natureza fundamental da realidade.',
  },
}

export function generateStaticParams() {
  return Object.keys(factions).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function FactionPage({ params }: PageProps) {
  const { slug } = await params
  const faction = factions[slug]

  if (!faction) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Facção não encontrada</h1>
          <Link href="/factions" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Facções
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
          <Link href="/factions" className="hover:text-amber-700">Facções</Link>
          <span>›</span>
          <span className="text-slate-800">{faction.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:rally-the-troops" className="w-10 h-10 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">{faction.type}</span>
                <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{faction.alignment}</span>
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{faction.name}</h1>
              <p className="text-slate-300 font-crimson text-lg italic">{faction.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* History */}
            <section className="bg-white/80 rounded-lg shadow-lg p-6">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                História
              </h2>
              <p className="text-slate-700 font-crimson leading-relaxed">{faction.history}</p>
            </section>

            {/* Dogma */}
            {faction.dogma && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:book-aura" className="w-6 h-6 text-amber-700" />
                  Dogma
                </h2>
                <ul className="space-y-3">
                  {faction.dogma.map((d: string, i: number) => (
                    <li key={i} className="text-slate-700 font-crimson italic border-l-4 border-amber-600 pl-4">
                      "{d}"
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Proverbs */}
            {faction.proverbs && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:quill-ink" className="w-6 h-6 text-amber-700" />
                  Provérbios
                </h2>
                <div className="grid gap-3">
                  {faction.proverbs.map((p: string, i: number) => (
                    <p key={i} className="text-slate-600 font-crimson text-sm bg-amber-50 rounded p-3">
                      "{p}"
                    </p>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Informações</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Sede</dt>
                  <dd className="text-slate-800 font-medium">{faction.headquarters}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Domínios</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {faction.domains.map((d: string) => (
                      <span key={d} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{d}</span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Portfólio</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {faction.portfolio.map((p: string) => (
                      <span key={p} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{p}</span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Members */}
            {faction.members.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6">
                <h3 className="font-cinzel text-lg text-slate-800 mb-4">Membros Conhecidos</h3>
                <ul className="space-y-2">
                  {faction.members.map((m: any) => (
                    <li key={m.name} className="flex items-center gap-2 text-sm">
                      <Icon icon="game-icons:cowled" className="w-4 h-4 text-amber-600" />
                      <span className="text-slate-800">{m.name}</span>
                      <span className="text-slate-500">- {m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
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
