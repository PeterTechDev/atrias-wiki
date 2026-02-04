/**
 * Lore Detail Page
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { LoreData } from '@/types/entities'

const categoryColors: Record<string, string> = {
  'Religiao': 'bg-amber-600/20 text-amber-400',
  'Historia': 'bg-blue-600/20 text-blue-400',
  'Cosmologia': 'bg-purple-600/20 text-purple-400',
  'Cultura': 'bg-green-600/20 text-green-400',
  'Magia': 'bg-cyan-600/20 text-cyan-400',
}

export async function generateStaticParams() {
  const loreEntries = await getEntitiesByType('lore')
  return loreEntries.map((l) => ({ slug: l.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LorePage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('lore', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as LoreData

  const lore = {
    name: entity.name,
    category: data.category || 'Historia',
    era: data.era || '',
    description: entity.description || '',
    dogma: data.dogma || [],
    proverbs: data.proverbs || [],
    significance: data.significance || '',
    contributor: 'AI Extraction',
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
                <span className={`text-xs px-2 py-1 rounded ${categoryColors[lore.category] || categoryColors['Historia']}`}>{lore.category}</span>
                {lore.era && (
                  <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{lore.era}</span>
                )}
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{lore.name}</h1>
              <p className="text-slate-300 font-crimson text-lg italic">{lore.description || 'Conhecimento antigo aguardando para ser revelado.'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dogma */}
            {lore.dogma.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:book-aura" className="w-6 h-6 text-amber-700" />
                  Dogma
                </h2>
                <ul className="space-y-3">
                  {lore.dogma.map((d, i) => (
                    <li key={i} className="text-slate-700 font-crimson italic border-l-4 border-amber-600 pl-4">
                      "{d}"
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Proverbs */}
            {lore.proverbs.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:quill-ink" className="w-6 h-6 text-amber-700" />
                  Proverbios
                </h2>
                <div className="grid gap-3">
                  {lore.proverbs.map((p, i) => (
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
              <h3 className="font-cinzel text-lg text-slate-800 mb-4">Informacoes</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Categoria</dt>
                  <dd className="text-slate-800 font-medium">{lore.category}</dd>
                </div>
                {lore.era && (
                  <div>
                    <dt className="text-slate-500">Era</dt>
                    <dd className="text-slate-800 font-medium">{lore.era}</dd>
                  </div>
                )}
                {lore.significance && (
                  <div>
                    <dt className="text-slate-500">Significancia</dt>
                    <dd className="text-slate-800 font-medium">{lore.significance}</dd>
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
            <span>Adicionado por:</span>
            <span className="text-slate-700 font-medium">{lore.contributor}</span>
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
            "Aqueles que nao conhecem a historia estao condenados a repetir seus erros."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
