/**
 * Monster/Creature Detail Page
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntityBySlug, getEntitiesByType } from '@/db/queries/entities'
import type { MonsterData } from '@/types/entities'

const dangerColors: Record<string, string> = {
  'Baixo': 'bg-green-600/20 text-green-400',
  'Medio': 'bg-yellow-600/20 text-yellow-400',
  'Alto': 'bg-orange-600/20 text-orange-400',
  'Extremo': 'bg-red-600/30 text-red-400',
}

export async function generateStaticParams() {
  const monsters = await getEntitiesByType('monster')
  return monsters.map((m) => ({ slug: m.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function MonsterPage({ params }: PageProps) {
  const { slug } = await params
  const entity = await getEntityBySlug('monster', slug)

  if (!entity) {
    notFound()
  }

  const data = entity.data as MonsterData

  const monster = {
    name: entity.name,
    type: data.type || 'Criatura',
    size: data.size || '',
    habitat: data.environment?.[0] || '',
    dangerLevel: '',
    alignment: data.alignment || '',
    cr: data.cr || '',
    description: entity.description || '',
    abilities: data.abilities || [],
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
          <Link href="/monsters" className="hover:text-amber-700">Bestiario</Link>
          <span>›</span>
          <span className="text-slate-800">{monster.name}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Hero Section */}
        <div className="bg-[#0a1628] rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="game-icons:spiked-dragon-head" className="w-10 h-10 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">{monster.type}</span>
                {monster.size && (
                  <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">{monster.size}</span>
                )}
                {monster.dangerLevel && (
                  <span className={`text-xs px-2 py-1 rounded ${dangerColors[monster.dangerLevel] || dangerColors['Medio']}`}>
                    \u26A0 Perigo: {monster.dangerLevel}
                  </span>
                )}
              </div>
              <h1 className="font-cinzel text-4xl text-amber-400 mb-2">{monster.name}</h1>
              <div className="text-slate-300 font-crimson text-lg italic space-y-4">{(monster.description || 'Uma criatura misteriosa aguardando para ser documentada.').split('\n\n').map((p, i) => (<p key={i}>{p}</p>))}</div>
              {monster.habitat && (
                <p className="text-slate-400 text-sm mt-2">
                  <Icon icon="game-icons:compass" className="w-4 h-4 inline mr-1" />
                  Habitat: {monster.habitat}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abilities */}
            {monster.abilities.length > 0 && (
              <section className="bg-white/80 rounded-lg shadow-lg p-6">
                <h2 className="font-cinzel text-2xl text-slate-800 mb-4 flex items-center gap-2">
                  <Icon icon="game-icons:burning-meteor" className="w-6 h-6 text-red-700" />
                  Habilidades
                </h2>
                <ul className="space-y-2">
                  {monster.abilities.map((ability, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Icon icon="game-icons:check-mark" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="font-crimson">{ability}</span>
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
                  <dd className="text-slate-800 font-medium">{monster.type}</dd>
                </div>
                {monster.size && (
                  <div>
                    <dt className="text-slate-500">Tamanho</dt>
                    <dd className="text-slate-800 font-medium">{monster.size}</dd>
                  </div>
                )}
                {monster.alignment && (
                  <div>
                    <dt className="text-slate-500">Alinhamento</dt>
                    <dd className="text-slate-800 font-medium">{monster.alignment}</dd>
                  </div>
                )}
                {monster.cr && (
                  <div>
                    <dt className="text-slate-500">Nivel de Desafio</dt>
                    <dd className="text-slate-800 font-medium">{monster.cr}</dd>
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
            <Link href="/characters/thaveus" className="text-slate-700 font-medium hover:text-amber-600 transition-colors">{monster.contributor}</Link>
          </div>
          {monster.lastUpdated && (
            <div className="text-slate-500">
              Atualizado em: {monster.lastUpdated}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Conhecer seu inimigo e o primeiro passo para sobreviver."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Atrias &copy; 2026</p>
        </div>
      </footer>
    </main>
  )
}
