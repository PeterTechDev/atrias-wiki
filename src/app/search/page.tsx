'use client'

/**
 * Search page with instant results
 */

import { useState, useEffect } from 'react'
import { client } from '@/sanity/client'
import Link from 'next/link'

interface SearchResult {
  _id: string
  _type: string
  name: string
  slug: { current: string }
  description?: string
}

const typeIcons: Record<string, string> = {
  character: '👤',
  place: '🗺️',
  faction: '⚔️',
  item: '🗡️',
  lore: '📜',
  monster: '👹',
}

const typeColors: Record<string, string> = {
  character: 'text-amber-300',
  place: 'text-green-300',
  faction: 'text-red-300',
  item: 'text-purple-300',
  lore: 'text-yellow-300',
  monster: 'text-pink-300',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await client.fetch(`
          *[
            _type in ["character", "place", "faction", "item", "lore", "monster"] &&
            (name match $q || description match $q)
          ] | order(name asc) [0...20] {
            _id, _type, name, slug, description
          }
        `, { q: `*${query}*` })
        setResults(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">🔍 Search</h1>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search characters, places, factions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {query.length > 0 && query.length < 2 && (
          <p className="text-zinc-500 text-center mt-8">Type at least 2 characters to search</p>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-2">
            <p className="text-zinc-500 text-sm mb-4">{results.length} results found</p>
            {results.map((result) => (
              <Link
                key={result._id}
                href={`/${result._type}s/${result.slug?.current || result._id}`}
                className="block bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-amber-400/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[result._type] || '📄'}</span>
                  <div>
                    <h3 className={`font-semibold ${typeColors[result._type] || 'text-zinc-200'}`}>
                      {result.name}
                    </h3>
                    <span className="text-xs text-zinc-500 uppercase">{result._type}</span>
                  </div>
                </div>
                {result.description && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{result.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="text-zinc-500 text-center mt-8">No results found for "{query}"</p>
        )}
      </div>
    </main>
  )
}
