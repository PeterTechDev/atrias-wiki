/**
 * Faction Detail Page
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { FactionData } from '@/types/entities'

export async function generateStaticParams() {
  const factions = await getEntitiesByType('faction')
  return factions.map((f) => ({ slug: f.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function FactionPage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('faction', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as FactionData

  const faction = {
    name: entity.name,
    type: data.domains?.[0] || 'Organizacao',
    alignment: data.alignment || '',
    description: entity.description || '',
    domains: data.domains || [],
    portfolio: data.portfolio || [],
    goals: data.goals || [],
    headquarters: data.headquarters || '',
    leader: data.leader || '',
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
          <Link href="/factions" className="hover:text-amber-700">Faccoes</Link>
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
                {faction.alignment && (
                  <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{faction.alignment}</span>
                )}
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{faction.name}</h1>
              <div className="text-slate-300 font-crimson text-lg italic space-y-4">{(faction.description || 'Uma organizacao influente em Atrias.').split('\n\n').map((p, i) => (<p key={i}>{p}</p>))}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domains */}
            {faction.domains.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:crowned-heart" className="w-6 h-6 text-amber-700" />
                  Dominios
                </h2>
                <div className="flex flex-wrap gap-3">
                  {faction.domains.map((d, i) => (
                    <span key={i} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Portfolio */}
            {faction.portfolio.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:scroll-unfurled" className="w-6 h-6 text-amber-700" />
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {faction.portfolio.map((p, i) => (
                    <div key={i} className="bg-amber-50 rounded-lg p-3 text-center">
                      <span className="text-slate-700 font-crimson">{p}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Goals */}
            {faction.goals.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:target-arrows" className="w-6 h-6 text-amber-700" />
                  Objetivos
                </h2>
                <ul className="space-y-3">
                  {faction.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Icon icon="game-icons:check-mark" className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <span className="text-slate-700 font-crimson">{goal}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white/80 rounded-lg shadow-lg p-6">
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Informacoes</h3>
              <dl className="space-y-3 text-sm">
                {faction.headquarters && (
                  <div>
                    <dt className="text-slate-500">Sede</dt>
                    <dd className="text-slate-800 font-medium">{faction.headquarters}</dd>
                  </div>
                )}
                {faction.leader && (
                  <div>
                    <dt className="text-slate-500">Lider</dt>
                    <dd className="text-slate-800 font-medium">{faction.leader}</dd>
                  </div>
                )}
                {faction.domains.length > 0 && (
                  <div>
                    <dt className="text-slate-500">Dominios</dt>
                    <dd className="flex flex-wrap gap-1 mt-1">
                      {faction.domains.map((d) => (
                        <span key={d} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">{d}</span>
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
            <span>Registrado por:</span>
            <Link href="/characters/thaveus" className="text-slate-700 font-medium hover:text-amber-600 transition-colors">{faction.contributor}</Link>
          </div>
          {faction.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {faction.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Lealdade e a moeda mais valiosa entre aqueles que servem a uma causa maior."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
