/**
 * Character Detail Page
 * Beautiful fantasy-styled character profile
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import DetailsToggle from '@/components/DetailsToggle'

// Base path for assets
const basePath = process.env.NODE_ENV === 'production' ? '/atrias-wiki' : ''

// Mocked character data
const characters: Record<string, any> = {
  'idris-rucandel': {
    name: 'Idris Rucandel',
    title: 'Chefe da Guarda de Solaria',
    race: 'Humano',
    class: 'Paladino',
    age: '~50 anos',
    status: 'Vivo',
    alignment: 'Leal e Bom',
    origin: 'Abrigo de Solaria, Colinas do Serpeio',
    faction: 'Ordem da Chama Branca',
    portrait: '/images/characters/idris-portrait.jpg',
    fullImage: '/images/characters/idris-full.jpg',
    description: 'Um paladino veterano que carrega o peso de fracassos passados, mas continua a servir sua comunidade com honra inabalável.',
    quote: '"Mesmo sob a nuvem de seus fracassos passados, Idris continuou a servir Solaria com um sorriso."',
    backstory: `Idris Rucandel foi um filho do Abrigo de Solaria, nascido sob o manto de uma família humilde. Os ecos da vida passada ainda se encontravam nas paredes cinzentas do castelo que dominava a paisagem da pequena vila nas Colinas do Serpeio. Solaria era um lugar amistoso, onde até os de sangue exótico encontravam abrigo.

Em sua juventude, Idris era conhecido por seu vigor e perspicácia, sua fibra moral tão firme quanto aço. A fama de suas virtudes alcançou a Ordem do Cálice, a respeitada cavalaria de Nerania que seguia os dogmas da Chama Prateada. Logo, o jovem Solariano foi arrancado de sua terra natal e enviado ao longe, para aprender os caminhos dos paladinos.

Embora tivesse dado tudo de si, Idris lutava para alcançar a grandeza de seus companheiros. Porém, um paladino — um homem chamado Vaelor — viu potencial no jovem e o incentivou a passar pelo rito de ascensão. Esse rito envolvia completar uma missão ao lado de seu mentor, depois acender sua própria chama de prata em um cálice.

No entanto, o destino não foi bondoso. O infortúnio os encontrou, e Vaelor perdeu sua vida. O espírito de Idris, embora abalado, recusou-se a se quebrar. Ele abandonou a Ordem e voltou para sua amada Solaria.`,
    laterLife: `Idris estava acima do comum agora, mas ainda sentia a responsabilidade de proteger seus conterrâneos. Uniu-se à guarda da cidade e, depois de alguns anos, tornou-se seu chefe. O tempo passou, seus pais se foram, mas ele continuou a cumprir seu dever.

Ele adorava frequentar a taverna do Leão Vermelho, compartilhar histórias com os habitantes, praticar sua aptidão física, e meditar com suas orações. Agora, perto dos cinquenta, Idris sentia o peso dos anos mais do que nunca.

Uma sombra de dúvida pairava sobre ele — ele fracassou em acender a chama prateada, falhou com Vaelor, falhou consigo mesmo. Essa dúvida, silenciosa e escura como a noite, costumava rastejar em sua mente enquanto ele compartilhava refeições com o inusitado Koboldi cozinheiro Gizmo, ou enquanto assistia o garoto Morpheys realizar seus truques mágicos para ganhar um punhado de moedas.`,
    destiny: `E, quando os céus se vermelharam e um cometa cruzou a escuridão, Idris sabia que uma nova era se aproximava — uma era de desafios, perigos e oportunidades para a redenção.`,
    relationships: [
      { name: 'Vaelor', relation: 'Mentor (Falecido)', description: 'O paladino que viu potencial em Idris e o incentivou no rito de ascensão.' },
      { name: 'Mestre Alderan', relation: 'Mentor (Falecido)', description: 'O velho paladino que guiou Idris na Ordem do Cálice.' },
      { name: 'Gizmo', relation: 'Amigo', description: 'Um inusitado cozinheiro Koboldi com quem Idris compartilha refeições.' },
      { name: 'Morpheys', relation: 'Protegido', description: 'Um jovem fugitivo das ruas que impressiona com truques de mágica.' },
    ],
    locations: [
      { name: 'Abrigo de Solaria', type: 'Terra Natal' },
      { name: 'Colinas do Serpeio', type: 'Região' },
      { name: 'Taverna Leão Vermelho', type: 'Local Frequente' },
      { name: 'Nerania', type: 'Reino' },
    ],
    traits: ['Honra Inabalável', 'Protetor', 'Carrega Culpa', 'Veterano', 'Líder Natural'],
    abilities: ['Combate Corpo a Corpo', 'Liderança', 'Fé Abalada', 'Experiência de Guerra'],
    contributor: 'Dungeon Master',
    lastUpdated: '2026-02-04',
  },
}

// Generate static params for all characters
export function generateStaticParams() {
  return Object.keys(characters).map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CharacterPage({ params }: PageProps) {
  const { slug } = await params
  const character = characters[slug]

  if (!character) {
    return (
      <main className="min-h-screen bg-[#e8dcc8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-cinzel text-slate-800">Personagem não encontrado</h1>
          <Link href="/characters" className="text-amber-700 hover:text-amber-600 mt-4 inline-block">
            ← Voltar para Personagens
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
          <Link href="/characters" className="hover:text-amber-700">Personagens</Link>
          <span>›</span>
          <span className="text-slate-800">{character.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Character Header Card */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              {/* Class Badge */}
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {character.class}
              </span>

              {/* Name with Drop Cap Effect */}
              <h1 className="font-cinzel text-4xl md:text-5xl text-slate-800 mb-2">
                <span className="text-6xl md:text-7xl text-amber-700 float-left mr-2 mt-1 leading-none">
                  {character.name.charAt(0)}
                </span>
                {character.name.slice(1)}
              </h1>

              {/* Title */}
              <p className="text-lg text-slate-600 italic font-crimson mb-6 clear-both">
                {character.title}
              </p>

              {/* Description */}
              <p className="text-slate-700 font-crimson text-lg leading-relaxed mb-4">
                {character.description}
              </p>

              {/* Quick Stats Toggle */}
              <DetailsToggle items={[
                { icon: 'game-icons:person', label: 'Raça', value: character.race },
                { icon: 'game-icons:ages', label: 'Idade', value: character.age },
                { icon: 'game-icons:health-normal', label: 'Status', value: character.status, color: character.status === 'Vivo' ? 'text-green-700' : 'text-red-700' },
                { icon: 'game-icons:compass', label: 'Alinhamento', value: character.alignment },
              ]} />
            </div>

            {/* Quote */}
            <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mb-8 rounded-r-lg">
              <p className="font-crimson italic text-lg text-slate-700">
                {character.quote}
              </p>
            </div>

            {/* Backstory */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                História
              </h2>
              
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {character.backstory.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                ))}
              </div>

              <h3 className="font-cinzel text-xl text-slate-800 mt-8 mb-4">Vida em Solaria</h3>
              <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                {character.laterLife.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                ))}
              </div>

              <h3 className="font-cinzel text-xl text-slate-800 mt-8 mb-4">O Destino Chama</h3>
              <p className="font-crimson text-lg text-slate-700 leading-relaxed">
                {character.destiny}
              </p>
            </div>

            {/* Relationships */}
            <div className="bg-white/80 rounded-lg shadow-lg p-8">
              <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <Icon icon="game-icons:two-shadows" className="w-6 h-6 text-amber-700" />
                Relacionamentos
              </h2>
              
              <div className="space-y-4">
                {character.relationships.map((rel: any, i: number) => (
                  <div key={i} className="border-b border-amber-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-cinzel text-lg text-slate-800">{rel.name}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {rel.relation}
                      </span>
                    </div>
                    <p className="text-slate-600 font-crimson">{rel.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Portrait */}
            {character.portrait && (
              <div className="mb-6 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={`${basePath}${character.portrait}`}
                  alt={character.name}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Full Image (if different from portrait) */}
            {character.fullImage && character.fullImage !== character.portrait && (
              <div className="mb-6 rounded-lg overflow-hidden shadow-xl">
                <img 
                  src={`${basePath}${character.fullImage}`}
                  alt={`${character.name} - Corpo completo`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Character Info Card */}
            <div className="bg-[#0a1628] text-white rounded-lg p-6 mb-6 sticky top-6">
              <h3 className="font-cinzel text-amber-400 text-lg mb-4 uppercase tracking-wider">
                Informações
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Afiliação</span>
                  <p className="text-white font-medium">{character.faction}</p>
                </div>
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Alinhamento</span>
                  <p className="text-white font-medium">{character.alignment}</p>
                </div>
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Origem</span>
                  <p className="text-white font-medium">{character.origin}</p>
                </div>
              </div>

              {/* Traits */}
              <h4 className="font-cinzel text-amber-400 text-sm mt-6 mb-3 uppercase tracking-wider">
                Traços
              </h4>
              <div className="flex flex-wrap gap-2">
                {character.traits.map((trait: string, i: number) => (
                  <span key={i} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Icon icon="game-icons:castle" className="w-5 h-5 text-amber-700" />
                Locais Relacionados
              </h3>
              
              <div className="space-y-3">
                {character.locations.map((loc: any, i: number) => (
                  <div key={i} className="bg-amber-50 rounded p-3">
                    <span className="text-amber-600 text-xs uppercase">{loc.type}</span>
                    <p className="font-cinzel text-slate-800">{loc.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Icon icon="game-icons:sword-brandish" className="w-5 h-5 text-amber-700" />
                Habilidades
              </h3>
              
              <ul className="space-y-2">
                {character.abilities.map((ability: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <Icon icon="game-icons:check-mark" className="w-4 h-4 text-amber-600" />
                    {ability}
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
            <span className="text-slate-700 font-medium">{character.contributor}</span>
          </div>
          {character.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {character.lastUpdated}
            </div>
          )}
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
