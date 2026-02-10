'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function SiteNav() {
  const pathname = usePathname()

  // The landing page has its own full-screen hero; keep it clean.
  if (pathname === '/') return null

  return (
    <header className="bg-[#0a1628] text-white py-3 px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
          <Icon icon="game-icons:book-cover" className="w-6 h-6" />
          <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/characters" className="text-amber-200/90 hover:text-amber-200">Personagens</Link>
          <Link href="/places" className="text-amber-200/90 hover:text-amber-200">Lugares</Link>
          <Link href="/factions" className="text-amber-200/90 hover:text-amber-200">Facções</Link>
          <Link href="/sessions" className="text-amber-200/90 hover:text-amber-200">Sessões</Link>
        </nav>
      </div>
    </header>
  )
}
