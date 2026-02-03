/**
 * Lore listing page
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Lore {
  _id: string
  name: string
  slug: { current: string }
  category?: string
  description?: string
}

async function getLore(): Promise<Lore[]> {
  return client.fetch(`
    *[_type == "lore" && isPlayerVisible == true] | order(name asc) {
      _id, name, slug, category, description
    }
  `)
}

export default async function LorePage() {
  const lore = await getLore()

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">📜 Lore</h1>
          <p className="text-zinc-400 mt-2">
            History, magic systems, and the secrets of Átrias
          </p>
        </div>

        {lore.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No lore entries yet</p>
            <p className="mt-2">Add lore via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="space-y-4">
            {lore.map((entry) => (
              <Link 
                key={entry._id} 
                href={`/lore/${entry.slug?.current || entry._id}`}
                className="block bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📜</span>
                  <div>
                    <h2 className="text-xl font-semibold text-yellow-300">{entry.name}</h2>
                    {entry.category && (
                      <span className="text-xs bg-zinc-700 px-2 py-1 rounded capitalize mt-1 inline-block">
                        {entry.category}
                      </span>
                    )}
                    {entry.description && (
                      <p className="text-zinc-400 text-sm mt-2">{entry.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
