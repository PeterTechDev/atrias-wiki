/**
 * Items listing page
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Item {
  _id: string
  name: string
  slug: { current: string }
  itemType?: string
  rarity?: string
  description?: string
}

async function getItems(): Promise<Item[]> {
  return client.fetch(`
    *[_type == "item" && isPlayerVisible == true] | order(name asc) {
      _id, name, slug, itemType, rarity, description
    }
  `)
}

export default async function ItemsPage() {
  const items = await getItems()

  const rarityColors: Record<string, string> = {
    common: 'text-zinc-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    'very rare': 'text-purple-400',
    legendary: 'text-orange-400',
    artifact: 'text-red-400',
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">🗡️ Items</h1>
          <p className="text-zinc-400 mt-2">
            Weapons, artifacts, and magical treasures
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No items yet</p>
            <p className="mt-2">Add items via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link 
                key={item._id} 
                href={`/items/${item.slug?.current || item._id}`}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-purple-400/50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-purple-300">{item.name}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {item.itemType && (
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded capitalize">{item.itemType}</span>
                  )}
                  {item.rarity && (
                    <span className={`text-xs px-2 py-1 rounded capitalize ${rarityColors[item.rarity.toLowerCase()] || 'text-zinc-400'}`}>
                      {item.rarity}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-2">{item.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
