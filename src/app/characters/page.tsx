/**
 * Characters listing page
 * Beautiful fantasy-styled character gallery
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import type { CharacterData } from '@/types/entities'

// Base path for assets
const basePath = process.env.NODE_ENV === 'production' ? '/atrias-wiki' : ''

export default async function CharactersPage() {
  const entities = await getEntitiesByType('character')

  const characters = entities.map((e) => {
    const data = e.data as CharacterData
    return {
      slug: e.slug,
      name: e.name,
      title: data.titles?.[0] || '',
      race: data.race || 'Desconhecido',
      class: data.class || 'Aventureiro',
      status: data.status || 'Desconhecido',
      faction: data.affiliation || '',
      portrait: '', // No images in DB yet
      description: e.description || '',
    }
  })

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
          <span className="text-slate-800">Personagens</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:cowled" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Personagens</h1>
              <p className="text-slate-600 font-crimson italic">Herois, viloes e todos entre eles</p>
            </div>
          </div>
          <p className="text-slate-700 font-crimson text-lg">
            Conheca os personagens que moldam o destino de Atrias. De paladinos honrados a magos misteriosos,
            cada alma carrega sua propria historia nas cronicas deste mundo.
          </p>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {characters.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="game-icons:empty-hourglass" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">Nenhum personagem encontrado</p>
            <p className="text-slate-500 mt-2">Os personagens serao adicionados em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char) => (
              <Link
                key={char.slug}
                href={`/characters/${char.slug}`}
                className="group bg-white/80 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Portrait Image */}
                {char.portrait ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`${basePath}${char.portrait}`}
                      alt={char.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <Icon icon="game-icons:cowled" className="w-20 h-20 text-slate-600" />
                  </div>
                )}

                {/* Card Header */}
                <div className="bg-[#0a1628] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded">
                      {char.class}
                    </span>
                    {char.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        char.status === 'Vivo'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}>
                        {char.status}
                      </span>
                    )}
                  </div>
                  <h2 className="font-cinzel text-xl text-amber-400 group-hover:text-amber-300 transition-colors">
                    {char.name}
                  </h2>
                  {char.title && <p className="text-slate-400 text-sm italic">{char.title}</p>}
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded flex items-center gap-1">
                      <Icon icon="game-icons:person" className="w-3 h-3" />
                      {char.race}
                    </span>
                    {char.faction && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center gap-1">
                        <Icon icon="game-icons:rally-the-troops" className="w-3 h-3" />
                        {char.faction}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm font-crimson line-clamp-3">
                    {char.description || 'Um personagem misterioso aguardando para ser descoberto.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-4 pb-4">
                  <span className="text-amber-700 text-sm font-medium group-hover:text-amber-600 flex items-center gap-1">
                    Ver perfil completo
                    <Icon icon="game-icons:arrow-scope" className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
