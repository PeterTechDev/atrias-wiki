/**
 * Places listing page
 */

import { client } from '@/sanity/client'
import Link from 'next/link'

interface Place {
  _id: string
  name: string
  slug: { current: string }
  placeType?: string
  region?: string
  description?: string
}

async function getPlaces(): Promise<Place[]> {
  return client.fetch(`
    *[_type == "place" && isPlayerVisible == true] | order(name asc) {
      _id, name, slug, placeType, region, description
    }
  `)
}

export default async function PlacesPage() {
  const places = await getPlaces()

  const placeIcons: Record<string, string> = {
    city: '🏰',
    village: '🏘️',
    region: '🗺️',
    landmark: '⛰️',
    dungeon: '🏚️',
    building: '🏛️',
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">🗺️ Places</h1>
          <p className="text-zinc-400 mt-2">
            Cities, dungeons, and lands to explore
          </p>
        </div>

        {places.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-xl">No places yet</p>
            <p className="mt-2">Add places via the <Link href="/studio" className="text-amber-400">Studio</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <Link 
                key={place._id} 
                href={`/places/${place.slug?.current || place._id}`}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-green-400/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{placeIcons[place.placeType || ''] || '📍'}</span>
                  <h2 className="text-xl font-semibold text-green-300">{place.name}</h2>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {place.placeType && (
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded capitalize">{place.placeType}</span>
                  )}
                  {place.region && (
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded">{place.region}</span>
                  )}
                </div>
                {place.description && (
                  <p className="text-zinc-400 text-sm mt-3 line-clamp-2">{place.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
