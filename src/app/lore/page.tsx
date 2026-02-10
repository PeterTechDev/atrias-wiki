/**
 * Lore listing page
 * History, legends, and knowledge of Atrias
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import type { LoreData } from '@/types/entities'

const categoryColors: Record<string, string> = {
  'Religiao': 'bg-amber-600/20 text-amber-400',
  'Historia': 'bg-blue-600/20 text-blue-400',
  'Cosmologia': 'bg-purple-600/20 text-purple-400',
  'Cultura': 'bg-green-600/20 text-green-400',
  'Magia': 'bg-cyan-600/20 text-cyan-400',
}

export default async function LorePage() {
  const entities = await getEntitiesByType('lore')

  const loreEntries = entities.map((e) => {
    const data = e.data as LoreData
    return {
      slug: e.slug,
      name: e.name,
      category: data.category || 'Historia',
      era: data.era || '',
      description: e.description || '',
    }
  })

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
          <span className="text-slate-800">Lore</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:scroll-unfurled" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Lore</h1>
              <p className="text-slate-600 font-crimson italic">Historia, lendas e conhecimento antigo</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Mergulhe nas profundezas do conhecimento de Atrias. Aqui repousam as historias antigas,
            os dogmas sagrados e os segredos que moldaram este mundo atraves das eras.
          </p>
        </div>
      </div>

      {/* Lore Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loreEntries.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:burning-book" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhum conhecimento encontrado</p>
            <p className="text-slate-500 mt-2">O lore sera adicionado em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loreEntries.map((lore) => (
              <Link
                key={lore.slug}
                href={`/lore/${lore.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${categoryColors[lore.category] || categoryColors['Historia']}`}>
                      {lore.category}
                    </span>
                    {lore.era && (
                      <span className="text-xs bg-slate-600/20 text-slate-400 px-2 py-1 rounded">
                        {lore.era}
                      </span>
                    )}
                  </div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {lore.name}
                  </h2>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-slate-600 text-sm font-crimson line-clamp-3">
                    {lore.description || 'Conhecimento antigo aguardando para ser revelado.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <span className="text-amber-700 text-sm font-medium group-hover:text-amber-600 flex items-center gap-1">
                    Ler mais
                    <Icon icon="game-icons:open-book" className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
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
