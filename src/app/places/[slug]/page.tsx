/**
 * Place Detail Page
 * Beautiful fantasy-styled location profile
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

// Base path for assets
const basePath = process.env.NODE_ENV === 'production' ? '/atrias-wiki' : ''

// Mocked places data
const places: Record<string, any> = {
  'abrigo-de-solaria': {
    name: 'Abrigo de Solaria',
    type: 'Vila',
    region: 'Colinas do Serpeio',
    kingdom: 'Nerania',
    population: '~2.000 habitantes',
    government: 'Conselho Local sob proteção de Nerania',
    description: 'Uma pequena vila acolhedora salpicada de casas rústicas e campos verdejantes, onde até os de sangue exótico encontram abrigo.',
    quote: '"Solaria era um lugar amistoso, onde até os de sangue exótico encontravam abrigo."',
    history: `O Abrigo de Solaria nasceu como um refúgio para aqueles que buscavam paz nas terras de Nerania. Fundada há séculos por colonos que fugiam dos conflitos das grandes cidades, a vila cresceu organicamente ao redor de um castelo cinzento que ainda domina a paisagem.

O castelo, agora em ruínas parciais, serve como um lembrete das glórias e horrores passados. Diz-se que foi construído por um lorde que buscava proteger os viajantes das criaturas que espreitavam nas Colinas do Serpeio. Com o tempo, a vila se tornou conhecida por sua hospitalidade — um lugar onde humanos, meio-elfos e até raças mais exóticas podiam viver em harmonia.`,
    geography: `Localizada nas Colinas do Serpeio, Solaria é cercada por campos verdejantes e colinas suaves que se estendem até onde a vista alcança. A vila fica em um vale protegido, com acesso a um riacho que fornece água fresca para os habitantes e irrigação para as fazendas.

O castelo cinzento ergue-se em uma elevação ao norte da vila, suas torres parcialmente desmoronadas criando uma silhueta melancólica contra o céu do entardecer. A estrada principal que atravessa Solaria conecta as rotas comerciais menores de Nerania, trazendo viajantes e mercadores ocasionais.`,
    culture: `Os solarenses são conhecidos por sua natureza acolhedora e espírito comunitário. A vila celebra festivais sazonais com música, dança e competições amistosas. A Taverna do Leão Vermelho serve como o coração social da comunidade, onde histórias são compartilhadas e amizades forjadas.

A guarda da cidade, liderada pelo veterano Idris Rucandel, mantém a paz com mão firme mas justa. Os habitantes respeitam a ordem mas valorizam ainda mais a compaixão — uma tradição que remonta aos fundadores da vila.`,
    landmarks: [
      { 
        name: 'O Castelo Cinzento', 
        type: 'Ruínas',
        description: 'As ruínas do antigo castelo que domina a paisagem da vila, um lembrete das glórias passadas.'
      },
      { 
        name: 'Taverna do Leão Vermelho', 
        type: 'Estabelecimento',
        description: 'O coração social de Solaria, onde histórias são compartilhadas e amizades forjadas ao redor de canecas de hidromel.'
      },
      { 
        name: 'Barraca do Gizmo', 
        type: 'Comércio',
        description: 'A barraca de comida do inusitado cozinheiro Koboldi, famosa por seus pratos exóticos e deliciosos.'
      },
      { 
        name: 'Praça Central', 
        type: 'Área Pública',
        description: 'Onde Morpheys costuma realizar seus truques de mágica para ganhar moedas dos aldeões.'
      },
    ],
    notableResidents: [
      { name: 'Idris Rucandel', role: 'Chefe da Guarda', link: '/characters/idris-rucandel' },
      { name: 'Gizmo', role: 'Cozinheiro Koboldi', link: null },
      { name: 'Morpheys', role: 'Jovem Mago de Rua', link: null },
    ],
    connections: [
      { name: 'Colinas do Serpeio', type: 'Região', description: 'A região montanhosa onde Solaria está localizada.' },
      { name: 'Nerania', type: 'Reino', description: 'O reino protetor ao qual Solaria pertence.' },
      { name: 'Ordem do Cálice', type: 'Organização', description: 'A ordem de paladinos que recrutou Idris desta vila.' },
    ],
    dangerLevel: 'Baixo',
    climate: 'Temperado',
    resources: ['Agricultura', 'Pastoreio', 'Artesanato Local'],
    tags: ['Vila', 'Refúgio', 'Colinas do Serpeio', 'Nerania', 'Pacífico'],
  },
}

// Generate static params for all places
export function generateStaticParams() {
  return Object.keys(places).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PlacePage({ params }: PageProps) {
  const { slug } = await params
  const place = places[slug]

  if (!place) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Local não encontrado</h1>
          <Link href="/places" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Lugares
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
          <Link href="/places" className="hover:text-amber-700">Lugares</Link>
          <span>›</span>
          <span className="text-slate-800">{place.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Place Header Card */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              {/* Type Badge */}
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {place.type}
              </span>

              {/* Name with Drop Cap Effect */}
              <h1 className="font-cinzel text-4xl md:text-5xl text-slate-800 mb-2">
                <span className="text-6xl md:text-7xl text-amber-700 float-left mr-2 mt-1 leading-none">
                  {place.name.charAt(0)}
                </span>
                {place.name.slice(1)}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-600 italic font-crimson mb-6 clear-both">
                {place.region}, {place.kingdom}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Icon icon="game-icons:village" className="w-4 h-4 text-amber-700" />
                  <span className="text-slate-600">População:</span>
                  <span className="text-slate-800 font-medium">{place.population}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="game-icons:crown" className="w-4 h-4 text-amber-700" />
                  <span className="text-slate-600">Governo:</span>
                  <span className="text-slate-800 font-medium">{place.government}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="game-icons:shield" className="w-4 h-4 text-amber-700" />
                  <span className="text-slate-600">Perigo:</span>
                  <span className={`font-medium ${
                    place.dangerLevel === 'Baixo' ? 'text-green-700' : 
                    place.dangerLevel === 'Médio' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {place.dangerLevel}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-700 font-crimson text-lg leading-relaxed">
                {place.description}
              </p>
            </div>

            {/* Quote */}
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 mb-8 rounded-r-lg">
              <p className="font-crimson italic text-lg text-slate-700">
                {place.quote}
              </p>
            </div>

            {/* History */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                História
              </h2>
              
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {place.history.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Geography */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:mountain-road" className="w-6 h-6 text-amber-700" />
                Geografia
              </h2>
              
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {place.geography.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Culture */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:public-speaker" className="w-6 h-6 text-amber-700" />
                Cultura & Sociedade
              </h2>
              
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {place.culture.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Landmarks */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:tower" className="w-6 h-6 text-amber-700" />
                Pontos de Interesse
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {place.landmarks.map((landmark: any, i: number) => (
                  <div key={i} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <span className="text-xs text-amber-600 uppercase tracking-wider">{landmark.type}</span>
                    <h3 className="font-cinzel text-lg text-slate-800 mt-1">{landmark.name}</h3>
                    <p className="text-slate-600 font-crimson text-sm mt-2">{landmark.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Place Info Card */}
            <div className="bg-[#0a1628] text-white rounded-lg p-6 mb-6 sticky top-6">
              <h3 className="font-cinzel text-amber-400 text-lg mb-4 uppercase tracking-wider">
                Informações
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Tipo</span>
                  <p className="text-white font-medium">{place.type}</p>
                </div>
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Região</span>
                  <p className="text-white font-medium">{place.region}</p>
                </div>
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Reino</span>
                  <p className="text-white font-medium">{place.kingdom}</p>
                </div>
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Clima</span>
                  <p className="text-white font-medium">{place.climate}</p>
                </div>
              </div>

              {/* Resources */}
              <h4 className="font-cinzel text-amber-400 text-sm mt-6 mb-3 uppercase tracking-wider">
                Recursos
              </h4>
              <div className="flex flex-wrap gap-2">
                {place.resources.map((resource: string, i: number) => (
                  <span key={i} className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded">
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            {/* Notable Residents */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Icon icon="game-icons:cowled" className="w-5 h-5 text-amber-700" />
                Residentes Notáveis
              </h3>
              
              <div className="space-y-3">
                {place.notableResidents.map((resident: any, i: number) => (
                  <div key={i} className="bg-amber-50 rounded p-3">
                    <span className="text-amber-600 text-xs uppercase">{resident.role}</span>
                    {resident.link ? (
                      <Link href={resident.link} className="block font-cinzel text-slate-800 hover:text-amber-700">
                        {resident.name} →
                      </Link>
                    ) : (
                      <p className="font-cinzel text-slate-800">{resident.name}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Icon icon="game-icons:world" className="w-5 h-5 text-amber-700" />
                Conexões
              </h3>
              
              <div className="space-y-3">
                {place.connections.map((conn: any, i: number) => (
                  <div key={i} className="border-b border-amber-200 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-cinzel text-slate-800">{conn.name}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {conn.type}
                      </span>
                    </div>
                    <p className="text-slate-600 font-crimson text-sm">{conn.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 flex items-center gap-3">
          <Icon icon="game-icons:tied-scroll" className="w-5 h-5 text-slate-500" />
          <span className="text-slate-500 text-sm">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {place.tags.map((tag: string, i: number) => (
              <span key={i} className="text-sm bg-white/60 text-slate-600 px-3 py-1 rounded-full border border-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "As crônicas de Átrias são escritas pelo sangue dos heróis e as lágrimas dos caídos."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
