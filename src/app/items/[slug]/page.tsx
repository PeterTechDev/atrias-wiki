/**
 * Item Detail Page
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { ItemData } from '@/types/entities'

const rarityColors: Record<string, string> = {
  'Comum': 'bg-slate-600/20 text-slate-400',
  'Incomum': 'bg-green-600/20 text-green-400',
  'Raro': 'bg-blue-600/20 text-blue-400',
  'Epico': 'bg-purple-600/20 text-purple-400',
  'Lendario': 'bg-amber-600/30 text-amber-400',
}

export async function generateStaticParams() {
  const items = await getEntitiesByType('item')
  return items.map((i) => ({ slug: i.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('item', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as ItemData

  const item = {
    name: entity.name,
    type: data.type || 'Item',
    rarity: data.rarity || 'Comum',
    attunement: data.attunement || false,
    description: entity.description || '',
    properties: data.properties || [],
    effects: data.effects || [],
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
          <Link href="/items" className="hover:text-amber-700">Itens</Link>
          <span>›</span>
          <span className="text-slate-800">{item.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:swap-bag" className="w-10 h-10 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-1 rounded">{item.type}</span>
                <span className={`text-xs px-2 py-1 rounded ${rarityColors[item.rarity] || rarityColors['Comum']}`}>{item.rarity}</span>
                {item.attunement && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Requer Sintonizacao</span>
                )}
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{item.name}</h1>
              <div className="text-slate-300 font-crimson text-lg italic space-y-4">{(item.description || 'Um item misterioso aguardando para ser descoberto.').split('\n\n').map((p, i) => (<p key={i}>{p}</p>))}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties */}
            {item.properties.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:sparkles" className="w-6 h-6 text-amber-700" />
                  Propriedades
                </h2>
                <ul className="space-y-2">
                  {item.properties.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Icon icon="game-icons:check-mark" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="font-crimson">{t}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Effects */}
            {item.effects.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:magic-swirl" className="w-6 h-6 text-amber-700" />
                  Efeitos
                </h2>
                <ul className="space-y-2">
                  {item.effects.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Icon icon="game-icons:sparkles" className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="font-crimson">{e}</span>
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
                <div>
                  <dt className="text-slate-500">Tipo</dt>
                  <dd className="text-slate-800 font-medium">{item.type}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Raridade</dt>
                  <dd className="text-slate-800 font-medium">{item.rarity}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sintonizacao</dt>
                  <dd className="text-slate-800 font-medium">{item.attunement ? 'Requerida' : 'Nao Requerida'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Contributor Attribution */}
        <div className="mt-8 pt-6 border-t border-amber-300/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Icon icon="game-icons:quill-ink" className="w-4 h-4" />
            <span>Registrado por:</span>
            <Link href="/characters/thaveus" className="text-slate-700 font-medium hover:text-amber-600 transition-colors">{item.contributor}</Link>
          </div>
          {item.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {item.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Todo artefato carrega a historia daqueles que o empunharam."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
