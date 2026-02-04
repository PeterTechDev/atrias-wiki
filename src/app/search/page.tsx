'use client'

/**
 * Search page with instant client-side filtering
 * Works with static export (no API routes needed)
 */

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface SearchableEntity {
  id: string
  type: string
  slug: string
  name: string
  description: string | null
}

// Game icons for each entity type
const typeIcons: Record<string, string> = {
  character: 'game-icons:hooded-figure',
  place: 'game-icons:castle',
  faction: 'game-icons:rally-the-troops',
  item: 'game-icons:swap-bag',
  lore: 'game-icons:scroll-unfurled',
  monster: 'game-icons:spiked-dragon-head',
  session: 'game-icons:quill-ink',
}

// Background colors for icon containers
const typeIconBg: Record<string, string> = {
  character: 'bg-amber-900/50',
  place: 'bg-green-900/50',
  faction: 'bg-purple-900/50',
  item: 'bg-cyan-900/50',
  lore: 'bg-yellow-900/50',
  monster: 'bg-red-900/50',
  session: 'bg-blue-900/50',
}

// Icon colors
const typeIconColor: Record<string, string> = {
  character: 'text-amber-400',
  place: 'text-green-400',
  faction: 'text-purple-400',
  item: 'text-cyan-400',
  lore: 'text-yellow-400',
  monster: 'text-red-400',
  session: 'text-blue-400',
}

// Text colors for names
const typeNameColor: Record<string, string> = {
  character: 'text-amber-300',
  place: 'text-green-300',
  faction: 'text-purple-300',
  item: 'text-cyan-300',
  lore: 'text-yellow-300',
  monster: 'text-red-300',
  session: 'text-blue-300',
}

// Map entity type to URL path (handles irregular plurals)
const typeToPath: Record<string, string> = {
  character: 'characters',
  place: 'places',
  faction: 'factions',
  item: 'items',
  lore: 'lore',
  monster: 'monsters',
  session: 'sessions',
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allEntities, setAllEntities] = useState<SearchableEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load search index on mount
  useEffect(() => {
    fetch('/search-index.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load search index')
        return res.json()
      })
      .then(data => {
        setAllEntities(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load search index:', err)
        setError('Failed to load search data. Please refresh the page.')
        setIsLoading(false)
      })
  }, [])

  // Client-side filtering
  const results = useMemo(() => {
    if (!query || query.length < 2) return []

    const searchLower = query.toLowerCase()
    return allEntities.filter(entity =>
      entity.name.toLowerCase().includes(searchLower) ||
      (entity.description?.toLowerCase().includes(searchLower) ?? false)
    ).slice(0, 20)
  }, [query, allEntities])

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-400 mt-4">Search</h1>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search characters, places, factions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-amber-400"
            autoFocus
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-900/30 border border-red-700 rounded-lg text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {query.length > 0 && query.length < 2 && (
          <p className="text-zinc-500 text-center mt-8">Type at least 2 characters to search</p>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-2">
            <p className="text-zinc-500 text-sm mb-4">{results.length} results found</p>
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/${typeToPath[result.type] || result.type}/${result.slug}`}
                className="block bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-amber-400/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Entity type icon */}
                  <div className={`w-12 h-12 rounded-lg ${typeIconBg[result.type] || 'bg-zinc-700'} flex items-center justify-center flex-shrink-0`}>
                    <Icon
                      icon={typeIcons[result.type] || 'game-icons:scroll-quill'}
                      className={`w-7 h-7 ${typeIconColor[result.type] || 'text-zinc-400'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${typeNameColor[result.type] || 'text-zinc-200'}`}>
                      {result.name}
                    </h3>
                    <span className="text-xs text-zinc-500 uppercase">{result.type}</span>
                    {result.description && (
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{result.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && !isLoading && !error && results.length === 0 && (
          <p className="text-zinc-500 text-center mt-8">No results found for &quot;{query}&quot;</p>
        )}
      </div>
    </main>
  )
}
