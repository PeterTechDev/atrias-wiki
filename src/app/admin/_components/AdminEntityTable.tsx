'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import type { Entity } from '@/db/schema'
import { collectionLabels, isAdminCollection } from '../_lib/entityTypes'

export function AdminEntityTable({
  collection,
  entities,
}: {
  collection: string
  entities: Entity[]
}) {
  const router = useRouter()

  async function onDelete(entity: Entity) {
    if (!confirm(`Are you sure you want to delete ${entity.name}? This cannot be undone.`)) return

    const res = await fetch(`/api/admin/entities/${entity.id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      alert(data?.error ?? 'Failed to delete.')
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white/70">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100/70 text-slate-700">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Slug</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                <td className="px-4 py-3 text-slate-700">{e.slug}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2 py-1 text-xs text-slate-700">
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/${collection}/${e.slug}/edit`}
                      className="inline-flex items-center gap-1 rounded bg-[#0a1628] px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
                    >
                      <Icon icon="game-icons:quill" className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(e)}
                      className="inline-flex items-center gap-1 rounded bg-red-900/80 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
                    >
                      <Icon icon="game-icons:trash-can" className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entities.length === 0 ? (
        <div className="text-center py-10 text-slate-600">
          <Icon icon="game-icons:empty-hourglass" className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          {(() => {
            const label = isAdminCollection(collection) ? collectionLabels[collection] : 'Entries'
            return (
              <div className="space-y-2">
                <p className="text-sm">
                  No {label.toLowerCase()} found.{' '}
                  <Link href={`/admin/${collection}/new`} className="text-amber-700 hover:text-amber-800 font-semibold">
                    Add the first one.
                  </Link>
                </p>
              </div>
            )
          })()}
        </div>
      ) : null}
    </div>
  )
}
