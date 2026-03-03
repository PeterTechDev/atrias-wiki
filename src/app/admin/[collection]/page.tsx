import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import { AdminShell } from '../_components/AdminShell'
import { AdminEntityTable } from '../_components/AdminEntityTable'
import { collectionLabels, collectionToEntityType, isAdminCollection } from '../_lib/entityTypes'

export default async function AdminCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const { collection } = await params

  if (!isAdminCollection(collection)) notFound()

  const type = collectionToEntityType[collection]
  const entities = await getEntitiesByType(type)

  const label = collectionLabels[collection]

  return (
    <AdminShell
      title={`${label}`}
      subtitle={`Manage ${label.toLowerCase()} in the wiki`}
      backHref="/admin"
      backLabel="Back to dashboard"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="text-sm text-slate-600">
          {entities.length} {entities.length === 1 ? 'entry' : 'entries'}
        </div>
        <Link
          href={`/admin/${collection}/new`}
          className="inline-flex items-center justify-center gap-2 rounded bg-[#0a1628] px-4 py-2 text-sm font-semibold text-amber-300 hover:text-amber-200"
        >
          <Icon icon="game-icons:plus" className="w-5 h-5" />
          New
        </Link>
      </div>

      <AdminEntityTable collection={collection} entities={entities} />
    </AdminShell>
  )
}
