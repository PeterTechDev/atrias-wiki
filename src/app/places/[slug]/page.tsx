/**
 * Place Detail Page
 * Beautiful fantasy-styled location profile
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import DetailsToggle from './DetailsToggle'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { PlaceData } from '@/types/entities'

// Generate static params for all places
export async function generateStaticParams() {
  const places = await getEntitiesByType('place')
  return places.map((place) => ({ slug: place.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PlacePage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('place', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as PlaceData

  const place = {
    name: entity.name,
    type: data.type || 'Local',
    region: data.region || '',
    kingdom: '',
    population: data.population || '',
    government: data.government || '',
    description: entity.description || '',
    quote: '',
    history: '',
    geography: '',
    culture: '',
    defenses: '',
    landmarks: [] as { name: string; type: string; description: string }[],
    notableResidents: [] as { name: string; role: string; link: string | null }[],
    connections: [] as { name: string; type: string; description: string }[],
    dangerLevel: '',
    climate: data.climate || '',
    resources: [] as string[],
    tags: [] as string[],
    function: data.function || '',
    design: data.design || '',
    notableLocations: data.notableLocations || [],
    contributor: 'Thaveus, O Escriba',
    lastUpdated: entity.updatedAt?.toISOString().split('T')[0] || '',
  }

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
          <Link href="/places" className="hover:text-amber-700">Lugares</Link>
          <span>›</span>
          <span className="text-slate-800">{place.name}</span>
        </nav>
      </div>

      {/* Map Image - Full Width */}
      {(data.map || entity.image) && (
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <div className="bg-white/80 rounded-lg shadow-lg overflow-hidden">
            <img 
              src={data.map || entity.image || ''} 
              alt={`Mapa de ${entity.name}`}
              className="w-full h-auto max-h-[500px] object-contain"
            />
            <div className="px-4 py-2 text-center text-sm text-slate-500 font-crimson italic">
              Mapa de {entity.name}
            </div>
          </div>
        </div>
      )}

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
              {place.region && (
                <p className="text-lg text-slate-600 italic font-crimson mb-6 clear-both">
                  {place.region}{place.kingdom ? `, ${place.kingdom}` : ''}
                </p>
              )}

              {/* Description */}
              <div className="text-slate-700 font-crimson text-lg leading-relaxed mb-4 space-y-4">
                {(place.description || 'Um lugar misterioso aguardando para ser explorado.').split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Quick Stats Toggle */}
              <DetailsToggle
                population={place.population}
                government={place.government}
                dangerLevel={place.dangerLevel}
                climate={place.climate}
              />
            </div>

            {/* Function & Design - if exists */}
            {(place.function || place.design) && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:info" className="w-6 h-6 text-amber-700" />
                  Detalhes
                </h2>

                {place.function && (
                  <div className="mb-4">
                    <h3 className="font-cinzel text-lg text-slate-700 mb-2">Funcao</h3>
                    <p className="text-slate-600 font-crimson">{place.function}</p>
                  </div>
                )}
                {place.design && (
                  <div>
                    <h3 className="font-cinzel text-lg text-slate-700 mb-2">Design</h3>
                    <p className="text-slate-600 font-crimson">{place.design}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notable Locations - if exists */}
            {place.notableLocations.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:tower" className="w-6 h-6 text-amber-700" />
                  Locais Notaveis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.notableLocations.map((loc, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="font-crimson text-slate-700">{loc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History - only if exists */}
            {place.history && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                  Historia
                </h2>

                <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                  {place.history.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Geography - only if exists */}
            {place.geography && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:mountain-road" className="w-6 h-6 text-amber-700" />
                  Geografia
                </h2>

                <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                  {place.geography.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Culture - only if exists */}
            {place.culture && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8 mb-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:public-speaker" className="w-6 h-6 text-amber-700" />
                  Cultura & Sociedade
                </h2>

                <div className="prose prose-slate max-w-none font-crimson text-lg leading-relaxed">
                  {place.culture.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Landmarks - only if exists */}
            {place.landmarks.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-8">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-6 flex items-center gap-3">
                  <Icon icon="game-icons:tower" className="w-6 h-6 text-amber-700" />
                  Pontos de Interesse
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.landmarks.map((landmark, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <span className="text-xs text-amber-600 uppercase tracking-wider">{landmark.type}</span>
                      <h3 className="font-cinzel text-lg text-slate-800 mt-1">{landmark.name}</h3>
                      <p className="text-slate-600 font-crimson text-sm mt-2">{landmark.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Place Info Card */}
            <div className="bg-[#0a1628] text-white rounded-lg p-6 mb-6 sticky top-6">
              <h3 className="font-cinzel text-amber-400 text-lg mb-4 uppercase tracking-wider">
                Informacoes
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-amber-400/60 text-xs uppercase tracking-wider">Tipo</span>
                  <p className="text-white font-medium">{place.type}</p>
                </div>
                {place.region && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Regiao</span>
                    <p className="text-white font-medium">{place.region}</p>
                  </div>
                )}
                {place.kingdom && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Reino</span>
                    <p className="text-white font-medium">{place.kingdom}</p>
                  </div>
                )}
                {place.climate && (
                  <div>
                    <span className="text-amber-400/60 text-xs uppercase tracking-wider">Clima</span>
                    <p className="text-white font-medium">{place.climate}</p>
                  </div>
                )}
              </div>

              {/* Resources */}
              {place.resources.length > 0 && (
                <>
                  <h4 className="font-cinzel text-amber-400 text-sm mt-6 mb-3 uppercase tracking-wider">
                    Recursos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {place.resources.map((resource, i) => (
                      <span key={i} className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded">
                        {resource}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notable Residents - only if exists */}
            {place.notableResidents.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:cowled" className="w-5 h-5 text-amber-700" />
                  Residentes Notaveis
                </h3>

                <div className="space-y-3">
                  {place.notableResidents.map((resident, i) => (
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
            )}

            {/* Connections - only if exists */}
            {place.connections.length > 0 && (
              <div className="bg-white/80 rounded-lg shadow-lg p-6">
                <h3 className="font-cinzel text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:world" className="w-5 h-5 text-amber-700" />
                  Conexoes
                </h3>

                <div className="space-y-3">
                  {place.connections.map((conn, i) => (
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
            )}
          </div>
        </div>

        {/* Tags - only if exists */}
        {place.tags.length > 0 && (
          <div className="mt-8 flex items-center gap-3">
            <Icon icon="game-icons:tied-scroll" className="w-5 h-5 text-slate-500" />
            <span className="text-slate-500 text-sm">Tags:</span>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag, i) => (
                <span key={i} className="text-sm bg-white/60 text-slate-600 px-3 py-1 rounded-full border border-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Registrado por:</span>
            <Link href="/characters/thaveus" className="text-slate-700 font-medium hover:text-amber-600 transition-colors">{place.contributor}</Link>
          </div>
          {place.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {place.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
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
