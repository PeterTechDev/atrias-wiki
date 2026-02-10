/**
 * Character Detail Page
 * Beautiful fantasy-styled character profile
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import DetailsToggle from '@/components/DetailsToggle'
import ImageGallery from '@/components/ImageGallery'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { CharacterData } from '@/types/entities'

// Generate static params for all characters
export async function generateStaticParams() {
  const characters = await getEntitiesByType('character')
  return characters.map((char) => ({ slug: char.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CharacterPage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('character', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as CharacterData

  // Build character object from entity data
  const character = {
    name: entity.name,
    title: data.titles?.[0] || '',
    race: data.race || 'Desconhecido',
    class: data.class || 'Aventureiro',
    age: '',
    status: data.status || 'Desconhecido',
    alignment: data.alignment || '',
    origin: '',
    faction: data.affiliation || '',
    gallery: (entity.image ? [{ src: entity.image, alt: entity.name, caption: entity.name }] : []) as { src: string; alt: string; caption?: string }[],
    description: entity.description || '',
    quote: '',
    backstory: '',
    relationships: [] as { name: string; relation: string; description: string }[],
    locations: [] as { name: string; type: string }[],
    traits: [] as string[],
    abilities: data.abilities || [],
    weaknesses: data.weaknesses || [],
    combat: data.combat,
    hierarchy: data.hierarchy || [],
    contributor: 'Thaveus, O Escriba',
    lastUpdated: entity.updatedAt?.toISOString().split('T')[0] || '',
  }

  return (
    <main className="min-h-screen bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ATRIAS</span>
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
              {character.title && (
                <p className="text-lg text-slate-600 italic font-crimson mb-6 clear-both">
                  {character.title}
                </p>
              )}

              {/* Description */}
              <div className="text-slate-700 font-crimson text-lg leading-relaxed mb-4 space-y-4">
                {(character.description || 'Um personagem misterioso do mundo de Atrias.').split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Quick Stats Toggle */}
              <DetailsToggle items={[
                { icon: 'game-icons:person', label: 'Raca', value: character.race },
                ...(character.age ? [{ icon: 'game-icons:ages', label: 'Idade', value: character.age }] : []),
                { icon: 'game-icons:health-normal', label: 'Status', value: character.status, color: character.status === 'Vivo' ? 'text-green-700' : 'text-red-700' },
                ...(character.alignment ? [{ icon: 'game-icons:compass', label: 'Alinhamento', value: character.alignment }] : []),
              ]} />
            </div>

            {/* Quote - only if exists */}
            {character.quote && (
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 mb-8 rounded-r-lg">
                <p className="font-crimson italic text-lg text-slate-700">
                  {character.quote}
                </p>
              </div>
            )}

            {/* Backstory - only if exists */}
            {character.backstory && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                  Historia
                </h2>

                <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                  {character.backstory.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Hierarchy - only if exists */}
            {character.hierarchy.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:podium" className="w-6 h-6 text-amber-700" />
                  Hierarquia
                </h2>

                <div className="space-y-2">
                  {character.hierarchy.map((level, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-amber-600 font-bold">{i + 1}.</span>
                      <span className="text-slate-700 font-crimson">{level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationships - only if exists */}
            {character.relationships.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:two-shadows" className="w-6 h-6 text-amber-700" />
                  Relacionamentos
                </h2>

                <div className="space-y-4">
                  {character.relationships.map((rel, i) => (
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
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Image Gallery */}
            {character.gallery && character.gallery.length > 0 && (
              <div className="mb-6">
                <ImageGallery images={character.gallery} />
              </div>
            )}

            {/* Character Info Card */}
            <div className="bg-[#0a1628] text-white rounded-lg p-6 mb-6 sticky top-6">
              <h3 className="font-cinzel text-amber-400 text-lg mb-4 uppercase tracking-wider">
                Informacoes
              </h3>

              <div className="space-y-4">
                {character.faction && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Afiliacao</span>
                    <p className="text-white font-medium">{character.faction}</p>
                  </div>
                )}
                {character.alignment && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Alinhamento</span>
                    <p className="text-white font-medium">{character.alignment}</p>
                  </div>
                )}
                {character.origin && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Origem</span>
                    <p className="text-white font-medium">{character.origin}</p>
                  </div>
                )}
              </div>

              {/* Traits */}
              {character.traits.length > 0 && (
                <>
                  <h4 className="font-cinzel text-amber-400 text-sm mt-6 mb-3 uppercase tracking-wider">
                    Tracos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {character.traits.map((trait, i) => (
                      <span key={i} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Locations - only if exists */}
            {character.locations.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:castle" className="w-5 h-5 text-amber-700" />
                  Locais Relacionados
                </h3>

                <div className="space-y-3">
                  {character.locations.map((loc, i) => (
                    <div key={i} className="bg-amber-50 rounded p-3">
                      <span className="text-amber-600 text-xs uppercase">{loc.type}</span>
                      <p className="font-cinzel text-slate-800">{loc.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Abilities - only if exists */}
            {character.abilities.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:sword-brandish" className="w-5 h-5 text-amber-700" />
                  Habilidades
                </h3>

                <ul className="space-y-2">
                  {character.abilities.map((ability, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <Icon icon="game-icons:check-mark" className="w-4 h-4 text-amber-600" />
                      {ability}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses - only if exists */}
            {character.weaknesses.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:broken-shield" className="w-5 h-5 text-red-700" />
                  Fraquezas
                </h3>

                <ul className="space-y-2">
                  {character.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <Icon icon="game-icons:cross-mark" className="w-4 h-4 text-red-600" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Combat Stats - only if exists */}
            {character.combat && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:crossed-swords" className="w-5 h-5 text-amber-700" />
                  Estatisticas de Combate
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {character.combat.ac && (
                    <div className="bg-amber-50 rounded p-3 text-center">
                      <span className="text-amber-600 text-xs uppercase">CA</span>
                      <p className="font-cinzel text-2xl text-slate-800">{character.combat.ac}</p>
                    </div>
                  )}
                  {character.combat.hp && (
                    <div className="bg-amber-50 rounded p-3 text-center">
                      <span className="text-amber-600 text-xs uppercase">PV</span>
                      <p className="font-cinzel text-lg text-slate-800">{character.combat.hp}</p>
                    </div>
                  )}
                  {character.combat.speed && (
                    <div className="bg-amber-50 rounded p-3 text-center col-span-2">
                      <span className="text-amber-600 text-xs uppercase">Deslocamento</span>
                      <p className="font-cinzel text-lg text-slate-800">{character.combat.speed}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Registrado por:</span>
            <Link href="/characters/thaveus" className="text-slate-700 font-medium hover:text-amber-600 transition-colors">{character.contributor}</Link>
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
            "As cronicas de Atrias sao escritas pelo sangue dos herois e as lagrimas dos caidos."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
