import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntityCounts } from '@/db/queries/entities'
import { AdminShell } from './_components/AdminShell'

export default async function AdminDashboardPage() {
  const counts = await getEntityCounts()

  const cards = [
    {
      href: '/admin/characters',
      label: 'Characters',
      count: counts.characters,
      icon: 'game-icons:cowled',
    },
    {
      href: '/admin/factions',
      label: 'Factions',
      count: counts.factions,
      icon: 'game-icons:rally-the-troops',
    },
    {
      href: '/admin/places',
      label: 'Places',
      count: counts.places,
      icon: 'game-icons:castle',
    },
    {
      href: '/admin/lore',
      label: 'Lore',
      count: counts.lore,
      icon: 'game-icons:spell-book',
    },
    {
      href: '/admin/items',
      label: 'Items',
      count: counts.items,
      icon: 'game-icons:broadsword',
    },
    {
      href: '/admin/monsters',
      label: 'Monsters',
      count: counts.monsters,
      icon: 'game-icons:hydra',
    },
  ]

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Content management for the Átrias Wiki"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-lg border border-slate-200 bg-white/70 p-5 hover:bg-white hover:border-amber-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon={c.icon} className="w-8 h-8 text-amber-700" />
                <div>
                  <div className="font-cinzel text-xl text-slate-900">{c.label}</div>
                  <div className="text-sm text-slate-600">{c.count} total</div>
                </div>
              </div>
              <Icon icon="game-icons:chevron-right" className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-slate-900/5 p-4 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <Icon icon="game-icons:info" className="w-5 h-5 text-amber-700" />
          <span>
            Auth is protected via <code className="font-mono">ADMIN_SECRET</code> (Basic Auth) if configured.
          </span>
        </div>
      </div>
    </AdminShell>
  )
}
