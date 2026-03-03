import Link from 'next/link'
import { Icon } from '@iconify/react'
import GraphClient from './GraphClient'

export const dynamic = 'force-dynamic'

export default function GraphPage() {
  return (
    <main className="min-h-screen bg-[#050b14]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>

          <div className="flex items-center gap-2 text-slate-300">
            <Icon icon="game-icons:mesh-network" className="w-5 h-5 text-amber-400" />
            <span className="font-cinzel tracking-wide">Graph</span>
          </div>
        </div>
      </header>

      {/* Canvas region */}
      <div className="relative">
        <GraphClient />
      </div>
    </main>
  )
}
