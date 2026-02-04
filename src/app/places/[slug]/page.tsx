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
    population: '~600 habitantes',
    government: 'Barão Aric Valtor com Conselho de Anciãos',
    description: 'Uma pequena vila situada nas Colinas do Serpeio, reconhecida por seu castelo de pedra cinzenta e pela diversidade de seus habitantes. Um lugar onde até os de sangue exótico encontram abrigo.',
    quote: '"Não fosse pelas ações de Reynard de Sollam, o corajoso Leão Vermelho, a vila teria sucumbido perante o medo e a fome."',
    history: `Solaria é uma pequena vila situada nas Colinas do Serpeio, entre os Picos do Alvorecer a Leste e a Passagem Crepitante que leva aos Bosques da Mortalha ao oeste. A vila é reconhecida por um castelo de pedra cinzenta que domina a paisagem, sendo visível de longe.

A população de Solaria é composta por cerca de 600 pessoas, onde é possível encontrar membros de cada um dos povos civilizados e não é incomum se deparar com indivíduos de ancestralidades exóticas, que em outros locais seriam hostilizados.

Isso se deve à história e cultura local, que no passado teve que lidar com grande opressão imposta por um governante tirano o qual possuía as terras ao redor. Não fosse pelas ações de Reynard de Sollam — um corajoso guerreiro e seguidor de Uther, o deus da Luz — bem como um grupo improvável de aliados de todos os cantos de Átrias, a vila teria sucumbido perante o medo e a fome.

Reynard tombou em batalha, mas por sua tenacidade e bravura recebeu a alcunha de "O Leão Vermelho", e a vila foi batizada de Abrigo de Solaria em homenagem à sua devoção e ao seu desejo de um lugar em que todos fossem acolhidos.`,
    geography: `Localizada nas Colinas do Serpeio, Solaria está estrategicamente posicionada entre os Picos do Alvorecer a Leste e a Passagem Crepitante que leva aos Bosques da Mortalha ao oeste.

O castelo de pedra cinzenta ergue-se dominando a paisagem, visível de longe para qualquer viajante que se aproxime. A vila é cercada por campos agricolas verdejantes e a mineração nas montanhas a leste extrai principalmente ferro e prata.

A estrada principal conecta Solaria às rotas comerciais da região, trazendo mercadores dos condados de Noan, os principais clientes dos minerais exportados pela Compania Roccia.`,
    culture: `Os solarenses são conhecidos por sua natureza acolhedora — uma herança direta dos ensinamentos de Reynard de Sollam. A vila celebra a diversidade, acolhendo humanos, meio-elfos e até raças mais exóticas que em outros lugares seriam hostilizadas.

A feira semanal é o coração do comércio local, vendendo frutas e vegetais frescos, produtos artesanais, ferramentas, tecidos e joias. A Taverna do Leão Vermelho, comandada por Thorne Ravenwood, serve como o ponto de encontro social onde histórias são compartilhadas.

Todos os cidadãos podem participar do treinamento semanal da milícia, aprendendo o manuseio de armas simples e estratégias de defesa, recebendo um soldo ao final do mês.`,
    defenses: `A milícia de Solaria é composta por cerca de 15 membros permanentes e 50 voluntários, a maioria fazendeiros e artesãos que lutam apenas em caso de necessidade. Usam armas simples como lanças, arcos e espadas, sem uniformes padronizados.

Os voluntários participam de treinamentos semanais e são dedicados e corajosos, prontos para defender sua vila a qualquer momento. A milícia trabalha em conjunto com os guardas do Barão e os caçadores locais para manter a paz.`,
    landmarks: [
      { 
        name: 'Forte Coroa Dourada', 
        type: 'Fortaleza',
        description: 'O imponente complexo fortificado com catedral, sede do governo e defesa da vila.'
      },
      { 
        name: 'Taverna do Leão Vermelho', 
        type: 'Taverna',
        description: 'Comandada por Thorne Ravenwood, é o coração social de Solaria onde histórias são compartilhadas.'
      },
      { 
        name: 'Fornalha Fulgurante', 
        type: 'Ferraria',
        description: 'A oficina do ferreiro Marcellus Stone, responsável pela produção de ferramentas locais.'
      },
      { 
        name: 'Fios da Rainha', 
        type: 'Loja',
        description: 'Loja de tecidos e roupas da meio-elfa Lysandra, bem relacionada com os nobres das cidades vizinhas.'
      },
      { 
        name: 'Sândalo Dourado', 
        type: 'Herbário',
        description: 'O herbário da curandeira Abigail, conhecida por suas ervas e remédios da região.'
      },
      { 
        name: 'Mercado Central', 
        type: 'Área Pública',
        description: 'Local da feira semanal onde frutas, vegetais e produtos artesanais são comercializados.'
      },
      { 
        name: 'Loja de Magia', 
        type: 'Comércio Arcano',
        description: 'Estabelecimento que vende itens e componentes mágicos para aventureiros.'
      },
    ],
    notableResidents: [
      { name: 'Barão Aric Valtor', role: 'Líder da Vila', link: null },
      { name: 'Idris Rucandel', role: 'Chefe da Guarda', link: '/characters/idris-rucandel' },
      { name: 'Thorne Ravenwood', role: 'Dono da Taverna Leão Vermelho', link: null },
      { name: 'Lysandra', role: 'Proprietária - Fios da Rainha', link: null },
      { name: 'Gwendolyn De Roccia', role: 'Chefe da Compania Roccia', link: null },
      { name: 'Marcellus Stone', role: 'Ferreiro', link: null },
      { name: 'Abigail', role: 'Curandeira', link: null },
      { name: 'Bertrand', role: 'Fazendeiro Chefe', link: null },
      { name: 'Gizmo', role: 'Cozinheiro Koboldi', link: null },
      { name: 'Morpheys', role: 'Jovem Mago de Rua', link: null },
    ],
    connections: [
      { name: 'Picos do Alvorecer', type: 'Montanhas', description: 'Cordilheira a leste de onde são extraídos ferro e prata.' },
      { name: 'Bosques da Mortalha', type: 'Floresta', description: 'Floresta misteriosa acessível pela Passagem Crepitante a oeste.' },
      { name: 'Condados de Noan', type: 'Reino', description: 'Principais clientes dos minerais exportados por Solaria.' },
      { name: 'Ordem do Cálice', type: 'Organização', description: 'A ordem de paladinos que recrutou Idris desta vila.' },
    ],
    dangerLevel: 'Baixo',
    climate: 'Temperado',
    resources: ['Agricultura', 'Mineração (Ferro e Prata)', 'Artesanato', 'Tecidos', 'Ervas Medicinais'],
    tags: ['Vila', 'Refúgio', 'Colinas do Serpeio', 'Diversidade', 'Mineração', 'Comércio'],
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

            {/* Defenses - only show if exists */}
            {place.defenses && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:crossed-swords" className="w-6 h-6 text-amber-700" />
                  Defesas
                </h2>
                
                <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                  {place.defenses.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

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
