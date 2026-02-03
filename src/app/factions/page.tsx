/**
 * Factions listing page
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Faction {
  _id: string
  name: string
  slug: { current: string }
  factionType?: string
  description?: string
}

async function getFactions(): Promise<Faction[]> {
  return client.fetch(`
    *[_type == "faction" && isPlayerVisible == true] | order(name asc) {
      _id, name, slug, factionType, description
    }
  `)
}

export default async function FactionsPage() {
  const factions = await getFactions()

  const factionIcons: Record<string, string> = {
    organization: '🏛️',
    religion: '✝️',
    guild: '⚒️',
    military: '⚔️',
    criminal: '🗡️',
    political: '👑',
    race: '🧝',
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">⚔️ Factions</h1>
          <p className="text-zinc-400 mt-2">
            Organizations, religions, and groups that shape Átrias
          </p>
        </div>

        {factions.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No factions yet</p>
            <p className="mt-2">Add factions via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factions.map((faction) => (
              <Link 
                key={faction._id} 
                href={`/factions/${faction.slug?.current || faction._id}`}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-red-400/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{factionIcons[faction.factionType || ''] || '⚔️'}</span>
                  <h2 className="text-xl font-semibold text-red-300">{faction.name}</h2>
                </div>
                {faction.factionType && (
                  <span className="text-xs bg-zinc-700 px-2 py-1 rounded capitalize mt-2 inline-block">
                    {faction.factionType}
                  </span>
                )}
                {faction.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-3">{faction.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
