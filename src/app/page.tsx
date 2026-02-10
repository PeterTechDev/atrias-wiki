/**
 * Atrias Wiki - Epic Fantasy Landing Page
 * Fantasy aesthetic with Cinzel font and warm colors
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import CinematicComet from '@/components/CinematicComet'
import { getEntityCounts, getEntitiesByType } from '@/db/queries/entities'

export default async function Home() {
  const stats = await getEntityCounts()
  const places = await getEntitiesByType('place')
  const characters = await getEntitiesByType('character')
  const factions = await getEntitiesByType('faction')

  const featuredPlaces = places.slice(0, 3)
  const recentCharacters = characters.slice(0, 3)
  const featuredFactions = factions.slice(0, 3)

  return (
    <main className="min-h-screen bg-[#0a1628] text-slate-100">
      {/* Hero Section with Fantasy Background */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('/hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Single unified mist overlay - like Lovable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/80 via-[#0a1628]/50 to-[#0a1628]" />

        {/* Cinematic Red Comet - behind content */}
        <CinematicComet />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -mt-20">
          {/* Title with Cinzel font */}
          <h1
            className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider"
            style={{
              color: '#c6a862',
              textShadow: '0 0 30px rgba(198, 168, 98, 0.3), 0 4px 20px rgba(0,0,0,0.6)',
            }}
          >
            WIKI ATRIAS
          </h1>

          {/* Subtitle */}
          <p
            className="font-manuscript mt-4 text-xl md:text-2xl italic text-amber-400/80"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            Desvende as Cronicas de Atrias
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#a8935a] hover:bg-[#c6a862] text-slate-900 font-semibold rounded-md transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Explorar os Arquivos
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-amber-400/30 hover:border-amber-400/60 text-amber-100 font-semibold rounded-md transition-all hover:-translate-y-1 backdrop-blur-sm bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Ver o Mapa do Mundo
            </Link>
          </div>
        </div>

        {/* Scroll indicator - at absolute bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-amber-400/50 z-20">
          <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-gradient-to-b from-[#0a1628] to-[#1a1a2e] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cinzel text-2xl text-amber-500/80 tracking-widest text-center uppercase">
            Navegacao Rapida
          </h2>

          <div className="mt-8 grid grid-cols-4 md:grid-cols-8 gap-4">
            {[
              { icon: 'game-icons:cowled', label: 'Personagens', count: stats.characters, href: '/characters' },
              { icon: 'game-icons:castle', label: 'Lugares', count: stats.places, href: '/places' },
              { icon: 'game-icons:rally-the-troops', label: 'Faccoes', count: stats.factions, href: '/factions' },
              { icon: 'game-icons:swap-bag', label: 'Itens', count: stats.items, href: '/items' },
              { icon: 'game-icons:scroll-unfurled', label: 'Lore', count: stats.lore, href: '/lore' },
              { icon: 'game-icons:spiked-dragon-head', label: 'Bestiario', count: stats.monsters, href: '/monsters' },
              { icon: 'game-icons:scroll-quill', label: 'Sessoes', count: 'Logs', href: '/sessions' },
              { icon: 'game-icons:hourglass', label: 'Timeline', count: 'Eras', href: '/timeline' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col items-center p-4 rounded-xl border border-amber-900/30 bg-amber-950/20 hover:bg-amber-900/30 hover:border-amber-600/50 transition-all hover:-translate-y-1"
              >
                <Icon icon={cat.icon} className="w-8 h-8 text-amber-400 group-hover:text-amber-300 group-hover:scale-110 transition-all" />
                <span className="mt-2 text-sm font-medium text-amber-100">{cat.label}</span>
                <span className="text-xs text-amber-500/60">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Realms - Warm cream style */}
      <section className="bg-[#e8dcc8] text-slate-800 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cinzel text-4xl md:text-5xl text-center tracking-wider text-slate-800 uppercase">
            Regioes em Destaque
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featuredPlaces.map((place, i) => (
              <div
                key={place.id}
                className="group bg-[#f5efe5] rounded-2xl overflow-hidden border border-amber-400 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
              >
                {/* Placeholder image with fantasy map style */}
                <div
                  className="h-48 bg-gradient-to-br from-emerald-100 via-amber-50 to-sky-100"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="p-6">
                  <h3 className="font-cinzel text-xl text-amber-800 tracking-wide uppercase">
                    {place.name}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 font-crimson leading-relaxed">
                    {place.description || "Um lugar misterioso aguardando para ser descoberto nas terras de Atrias."}
                  </p>
                  <Link
                    href={`/places/${place.slug}`}
                    className="mt-4 inline-flex items-center text-amber-700 font-semibold hover:text-amber-900 transition-colors"
                  >
                    Ler Mais →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Chronicles - Dark theme */}
      <section className="bg-gradient-to-b from-[#1a1a2e] to-[#0a1628] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cinzel text-3xl text-amber-500 tracking-wider uppercase">
            Cronicas Recentes
          </h2>
          <p className="mt-2 text-amber-400/60 font-crimson italic">
            Personagens que marcaram a historia de Atrias
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {recentCharacters.map((char, i) => (
              <Link
                key={char.id}
                href={`/characters/${char.slug}`}
                className="group p-6 rounded-2xl border border-amber-900/30 bg-gradient-to-br from-slate-900/50 to-slate-800/30 hover:border-amber-600/50 transition-all hover:-translate-y-1"
              >
                <div className="text-xs uppercase tracking-widest text-amber-600/70 font-cinzel">
                  Personagem
                </div>
                <h3 className="mt-3 text-xl font-cinzel text-amber-400 group-hover:text-amber-100">
                  {char.name}
                </h3>
                <p className="mt-3 text-sm text-slate-300/80 font-crimson line-clamp-2">
                  {char.description || "Um personagem misterioso do mundo de Atrias."}
                </p>
                <span className="mt-4 inline-flex items-center text-sm text-amber-600 group-hover:translate-x-1 transition-transform">
                  Ler cronica →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Factions Section */}
      <section className="bg-[#0a1628] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-3xl text-amber-700 tracking-wider uppercase">
                Ordens & Faccoes
              </h2>
              <p className="mt-2 text-amber-600/60 font-crimson italic">
                As organizacoes que moldam o destino de Atrias
              </p>
            </div>
            <Link href="/factions" className="text-amber-700 hover:text-amber-600 text-sm font-semibold">
              Ver todas →
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featuredFactions.map((faction, i) => (
              <div
                key={faction.id}
                className="group flex items-start gap-4 p-5 rounded-xl border border-amber-950/30 bg-stone-900/10 hover:bg-amber-950/20 hover:border-amber-800/40 transition-all"
              >
                <span className="text-2xl">\u2694\uFE0F</span>
                <div>
                  <h3 className="font-cinzel text-amber-600 tracking-wide">{faction.name}</h3>
                  <p className="mt-1 text-sm text-slate-400 font-crimson">
                    {faction.description?.slice(0, 80) || "Uma organizacao influente em Atrias."}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-[#0a1628] to-slate-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-cinzel text-3xl text-stone-400 tracking-wider uppercase">
                Sobre o Codex
              </h2>
              <p className="mt-6 text-lg text-slate-300 font-crimson leading-relaxed">
                O Codex de Atrias e um compendio vivo de conhecimento, mantido por arquivistas
                e aventureiros dedicados a preservar cada detalhe deste mundo fantastico.
              </p>
              <p className="mt-4 text-slate-400 font-crimson">
                Cada entrada e cuidadosamente extraida dos documentos originais do Mestre
                usando inteligencia artificial, garantindo precisao e fidelidade ao lore.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/studio" className="px-6 py-2 border border-stone-500/40 text-stone-400 rounded-lg hover:bg-stone-900/30 transition-colors">
                  Contribuir
                </Link>
                <Link href="/search" className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors">
                  Pesquisar
                </Link>
              </div>
            </div>

            <div className="relative p-8 rounded-2xl border border-stone-800/30 bg-gradient-to-br from-slate-900/80 to-stone-900/30">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-stone-500/10 via-transparent to-amber-500/10 blur-xl" />
              <div className="relative space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Total de Entradas</p>
                  <p className="mt-1 text-4xl font-cinzel text-amber-500">{stats.total}+</p>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Continentes</p>
                  <p className="mt-1 text-4xl font-cinzel text-emerald-300">7</p>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Documentos Analisados</p>
                  <p className="mt-1 text-4xl font-cinzel text-stone-400">15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <p className="font-crimson">&copy; 2026 Wiki Atrias. Um cenario de campanha de D&D.</p>
          <div className="flex gap-6">
            <Link href="/studio" className="hover:text-amber-600 transition-colors">Studio</Link>
            <Link href="/search" className="hover:text-amber-600 transition-colors">Pesquisar</Link>
            <Link href="/demo" className="hover:text-amber-600 transition-colors">Demo</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
