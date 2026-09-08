'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export function WikiContributionActions({ collection, slug, enabled = true }: { collection: string; slug?: string; enabled?: boolean }) {
  const { user, loading } = useAuth()
  if (!enabled || loading || !user) return null

  return (
    <Link
      href={slug ? `/wiki/${collection}/${slug}/edit` : `/wiki/${collection}/new`}
      className="inline-flex items-center rounded border border-amber-700 bg-amber-700 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800"
    >
      {slug ? 'Editar página' : 'Adicionar página'}
    </Link>
  )
}
