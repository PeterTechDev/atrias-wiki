'use client'

/**
 * Search page with instant results
 */

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import type { SearchResult } from '@/types/entities'

const typeIcons: Record<string, string> = {
  character: '\u{1F464}',
  place: '\u{1F5FA}\u{FE0F}',
  faction: '\u{2694}\u{FE0F}',
  item: '\u{1F5E1}\u{FE0F}',
  lore: '\u{1F4DC}',
  monster: '\u{1F479}',
}

const typeColors: Record<string, string> = {
  character: 'text-amber-300',
  place: 'text-green-300',
  faction: 'text-red-300',
  item: 'text-purple-300',
  lore: 'text-yellow-300',
  monster: 'text-pink-300',
}

// Map entity type to URL path (handles irregular plurals)
const typeToPath: Record<string, string> = {
  character: 'characters',
  place: 'places',
  faction: 'factions',
  item: 'items',
  lore: 'lore', // No 's' - irregular
  monster: 'monsters',
  session: 'sessions',
}

interface SearchState {
  results: SearchResult[]
  error: string | null
}

async function searchEntitiesAction(query: string): Promise<SearchState> {
  if (!query || query.length < 2) {
    return { results: [], error: null }
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        results: [],
        error: errorData.error || 'Search failed. Please try again.'
      }
    }

    const results = await res.json()
    return { results, error: null }
  } catch (error) {
    console.error('Search request failed:', error)
    return {
      results: [],
      error: 'Unable to connect to search. Please check your connection.'
    }
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({ results: [], error: null })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (query.length < 2) {
      setSearchState({ results: [], error: null })
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const state = await searchEntitiesAction(query)
        setSearchState(state)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const { results, error } = searchState

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
          />
          {isPending && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {query.length > 0 && query.length < 2 && (
          <p className="text-zinc-500 text-center mt-8">Type at least 2 characters to search</p>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/30 border border-red-700 rounded-lg text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setQuery(query + ' ')}
              className="mt-2 text-sm text-amber-400 hover:text-amber-300"
            >
              Try again
            </button>
          </div>
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
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[result.type] || '\u{1F4C4}'}</span>
                  <div>
                    <h3 className={`font-semibold ${typeColors[result.type] || 'text-zinc-200'}`}>
                      {result.name}
                    </h3>
                    <span className="text-xs text-zinc-500 uppercase">{result.type}</span>
                  </div>
                </div>
                {result.description && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{result.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && !isPending && !error && results.length === 0 && (
          <p className="text-zinc-500 text-center mt-8">No results found for &quot;{query}&quot;</p>
        )}
      </div>
    </main>
  )
}
