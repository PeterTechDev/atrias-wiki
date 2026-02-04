/**
 * Lore Detail Page
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'

const loreEntries: Record<string, any> = {
  'dogma-da-chama-branca': {
    name: 'Dogma da Chama Branca',
    category: 'Religião',
    era: 'Era Atual',
    description: 'Os princípios guia da fé, enfatizando verdade, justiça e ordem.',
    content: `O Dogma da Chama Branca forma o núcleo dos ensinamentos desta antiga fé. Seus seguidores acreditam que a verdade é a luz que dissipa as trevas da corrupção, e que a justiça é o caminho para a paz duradoura.

Os preceitos fundamentais são:

**Primeiro Preceito:** Revele a verdade, puna os culpados, corrija o erro e seja sempre verdadeiro e justo em suas ações.

**Segundo Preceito:** A ordem é o caminho que trilhamos em comunhão para promover o bem-estar de todos.

Estes ensinamentos são passados de geração em geração, formando a base moral das comunidades que seguem a Chama Branca.`,
    relatedTopics: ['Chama Branca', 'Ordem do Cálice', 'Paladinos'],
    sources: ['Textos Sagrados da Chama Branca'],
  },
  'proverbios-da-chama-branca': {
    name: 'Provérbios da Chama Branca',
    category: 'Religião',
    era: 'Era Atual',
    description: 'Provérbios que encapsulam os ensinamentos e valores da Chama Branca.',
    content: `Os provérbios da Chama Branca são ditos populares que destilam a sabedoria da fé em frases memoráveis. São frequentemente citados por fiéis e usados para ensinar os princípios da ordem aos jovens.

**Sobre a Verdade:**
"A verdade ilumina o caminho, mas a justiça é a luz que guia nossos passos."

**Sobre a Ordem:**
"Onde há ordem, a paz prospera; onde há paz, a justiça se estabelece."

**Sobre o Serviço:**
"O bem comum é uma chama que se alimenta do serviço e da solidariedade."

**Sobre a Justiça:**
"Em cada ato de justiça, a luz da Chama Branca brilha mais intensamente."

**Sobre a Sabedoria:**
"A sabedoria é o farol que orienta a jornada daqueles que buscam a iluminação."

**Sobre a Redenção:**
"A redenção é a chama que renova o espírito, permitindo que cada passo dado seja um avanço em direção à luz."`,
    relatedTopics: ['Dogma da Chama Branca', 'Chama Branca'],
    sources: ['Tradição Oral', 'Livro dos Provérbios Sagrados'],
  },
  'a-grande-destruicao': {
    name: 'A Grande Destruição',
    category: 'História',
    era: 'Era Antiga',
    description: 'O cataclismo mágico que reformulou Átrias.',
    content: `A Grande Destruição foi o evento mais catastrófico da história de Átrias. Ocorreu quando magos poderosos, em sua arrogância, tentaram manipular as próprias fundações da realidade.

O cataclismo resultante devastou continentes inteiros, alterou o curso de rios, afundou ilhas e levantou montanhas onde antes havia planícies. Milhões pereceram, e civilizações inteiras foram apagadas da existência.

**Consequências:**

1. **Criação da Alta'Arcanas:** Em resposta à destruição, Khay'zam e outros sobreviventes fundaram a Alta'Arcanas para regular o uso da magia e prevenir futuras catástrofes.

2. **Os Caçadores de Sangue:** Uma força marcial foi criada para caçar magos renegados que se recusassem a seguir as novas regras.

3. **Mudança Geográfica:** O próprio mapa de Átrias foi redesenhado pelo cataclismo.

4. **Medo da Magia:** Muitas comunidades desenvolveram um profundo medo e desconfiança em relação a usuários de magia.

Este evento serve como um lembrete sombrio do poder destrutivo da magia descontrolada.`,
    relatedTopics: ['Alta\'Arcanas', 'Caçadores de Sangue', 'Khay\'zam'],
    sources: ['Crônicas dos Sobreviventes', 'Registros da Alta\'Arcanas'],
  },
  'origem-dos-djinns': {
    name: 'Origem dos Djinns',
    category: 'Cosmologia',
    era: 'Era Primordial',
    description: 'A história dos seres elementais que habitam os planos além de Átrias.',
    content: `Os Djinns são seres ancestrais que existem desde antes da formação do mundo material. Eles habitam os Planos Elementais - dimensões de pura energia elemental onde fogo, água, ar e terra existem em sua forma mais pura.

**Natureza dos Djinns:**

Os Djinns são manifestações conscientes das forças elementais. Diferente de elementais menores, que são pouco mais que força bruta, os Djinns possuem inteligência, personalidade e vontade própria.

**A Jornada de Amergin:**

O conhecimento mais profundo sobre os Djinns veio através de Amergin Ghalbath, um mortal que conseguiu viajar pelos Planos Elementais. Durante sua jornada, Amergin encontrou e aprendeu com diversos Djinns, trazendo de volta ensinamentos que formariam a base da Ordem de Ghalbath.

**Hierarquia:**

Os Djinns são organizados em uma complexa hierarquia baseada em poder e antiguidade. Os mais poderosos são conhecidos como Sultões ou Califas, governando vastos domínios em seus respectivos planos.

**Interação com Mortais:**

Djinns raramente se envolvem com o mundo mortal, mas quando o fazem, podem ser aliados poderosos ou inimigos terríveis. Alguns podem ser convocados através de rituais antigos, mas fazer pactos com Djinns é extremamente perigoso.`,
    relatedTopics: ['Amergin Ghalbath', 'Ordem de Ghalbath', 'Planos Elementais'],
    sources: ['Diários de Amergin', 'Tratados da Ordem de Ghalbath'],
  },
}

const categoryColors: Record<string, string> = {
  'Religião': 'bg-amber-600/20 text-amber-400',
  'História': 'bg-blue-600/20 text-blue-400',
  'Cosmologia': 'bg-purple-600/20 text-purple-400',
  'Cultura': 'bg-green-600/20 text-green-400',
  'Magia': 'bg-cyan-600/20 text-cyan-400',
}

export function generateStaticParams() {
  return Object.keys(loreEntries).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LorePage({ params }: PageProps) {
  const { slug } = await params
  const lore = loreEntries[slug]

  if (!lore) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Conhecimento não encontrado</h1>
          <Link href="/lore" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Lore
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
          <Link href="/lore" className="hover:text-amber-700">Lore</Link>
          <span>›</span>
          <span className="text-slate-800">{lore.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:scroll-unfurled" className="w-10 h-10 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${categoryColors[lore.category]}`}>{lore.category}</span>
                <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{lore.era}</span>
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{lore.name}</h1>
              <p className="text-slate-300 font-crimson text-lg italic">{lore.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white/80 rounded-lg shadow-lg p-8">
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {lore.content.split('\n\n').map((paragraph: string, i: number) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h3 key={i} className="font-cinzel text-xl text-slate-800 mt-6 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>
                  }
                  if (paragraph.startsWith('**')) {
                    const [title, ...rest] = paragraph.split(':**')
                    return (
                      <div key={i} className="my-4">
                        <h4 className="font-semibold text-slate-800">{title.replace(/\*\*/g, '')}:</h4>
                        <p className="text-slate-700">{rest.join(':**')}</p>
                      </div>
                    )
                  }
                  if (paragraph.match(/^\d\./)) {
                    return (
                      <div key={i} className="my-2 pl-4 border-l-2 border-amber-300">
                        <p className="text-slate-700">{paragraph}</p>
                      </div>
                    )
                  }
                  return <p key={i} className="text-slate-700 mb-4">{paragraph}</p>
                })}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Topics */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Tópicos Relacionados</h3>
              <div className="flex flex-wrap gap-2">
                {lore.relatedTopics.map((topic: string) => (
                  <span key={topic} className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Fontes</h3>
              <ul className="space-y-2">
                {lore.sources.map((source: string) => (
                  <li key={source} className="flex items-center gap-2 text-sm text-slate-600">
                    <Icon icon="game-icons:book-cover" className="w-4 h-4 text-amber-600" />
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Adicionado por:</span>
            <span className="text-slate-700 font-medium">{lore.contributor || 'Dungeon Master'}</span>
          </div>
          {lore.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {lore.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Aqueles que não conhecem a história estão condenados a repetir seus erros."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
