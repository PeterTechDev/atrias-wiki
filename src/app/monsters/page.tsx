/**
 * Monsters listing page (DM only view)
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Monster {
  _id: string
  name: string
  slug: { current: string }
  monsterType?: string
  challengeRating?: string
  description?: string
}

async function getMonsters(): Promise<Monster[]> {
  return client.fetch(`
    *[_type == "monster"] | order(name asc) {
      _id, name, slug, monsterType, challengeRating, description
    }
  `)
}

export default async function MonstersPage() {
  const monsters = await getMonsters()

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">👹 Monsters</h1>
          <p className="text-zinc-400 mt-2">
            Creatures and beasts of Átrias
          </p>
          <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-sm text-red-300">
            ⚠️ DM Section — Contains spoilers!
          </div>
        </div>

        {monsters.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No monsters yet</p>
            <p className="mt-2">Add monsters via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <Link 
                key={monster._id} 
                href={`/monsters/${monster.slug?.current || monster._id}`}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-pink-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-300">{monster.name}</h2>
                  {monster.challengeRating && (
                    <span className="text-xs bg-pink-900/50 text-pink-300 px-2 py-1 rounded">
                      CR {monster.challengeRating}
                    </span>
                  )}
                </div>
                {monster.monsterType && (
                  <span className="text-xs text-zinc-500 capitalize">{monster.monsterType}</span>
                )}
                {monster.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-2">{monster.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
