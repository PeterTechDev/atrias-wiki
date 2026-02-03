/**
 * Characters listing page
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Character {
  _id: string
  name: string
  slug: { current: string }
  race?: string
  characterClass?: string
  title?: string
  status?: string
  description?: string
}

async function getCharacters(): Promise<Character[]> {
  return client.fetch(`
    *[_type == "character" && isPlayerVisible == true] | order(name asc) {
      _id, name, slug, race, characterClass, title, status, description
    }
  `)
}

export default async function CharactersPage() {
  const characters = await getCharacters()

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">👤 Characters</h1>
          <p className="text-zinc-400 mt-2">
            Heroes, villains, and everyone in between
          </p>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No characters yet</p>
            <p className="mt-2">Add characters via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => (
              <Link 
                key={char._id} 
                href={`/characters/${char.slug?.current || char._id}`}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-amber-400/50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-amber-300">{char.name}</h2>
                {char.title && (
                  <p className="text-zinc-400 text-sm italic">{char.title}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {char.race && (
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded">{char.race}</span>
                  )}
                  {char.characterClass && (
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded">{char.characterClass}</span>
                  )}
                  {char.status && char.status !== 'alive' && (
                    <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">{char.status}</span>
                  )}
                </div>
                {char.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-2">{char.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
