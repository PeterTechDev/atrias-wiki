import Link from 'next/link'
import { Icon } from '@iconify/react'

export function AdminShell({
  title,
  subtitle,
  backHref,
  backLabel,
  children,
}: {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#0a1628] text-amber-400">
      <header className="bg-[#0a1628] text-white py-4 px-6 border-b border-amber-400/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ATRIAS</span>
          </Link>
          <Link
            href="/admin"
            className="text-sm text-amber-400/90 hover:text-amber-300 flex items-center gap-2"
          >
            <Icon icon="game-icons:shield" className="w-5 h-5" />
            Admin
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {backHref ? (
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 mb-4">
            <Icon icon="game-icons:back-forth" className="w-4 h-4" />
            {backLabel ?? 'Back'}
          </Link>
        ) : null}

        <div className="bg-[#e8dcc8] text-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <Icon icon="game-icons:quill-ink" className="w-10 h-10 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-3xl">{title}</h1>
              {subtitle ? <p className="text-slate-600 font-crimson italic">{subtitle}</p> : null}
            </div>
          </div>

          {children}
        </div>
      </div>

      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6 border-t border-amber-400/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">Admin tools — handle with care.</p>
        </div>
      </footer>
    </main>
  )
}
