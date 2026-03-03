import { notFound } from 'next/navigation'
import { AdminShell } from '../../_components/AdminShell'
import { AdminEntityForm } from '../../_components/AdminEntityForm'
import { collectionLabels, collectionSingularLabels, collectionToEntityType, isAdminCollection } from '../../_lib/entityTypes'

export default async function AdminNewEntityPage({
  params,
}: {
  params: Promise<{ collection: string }>
}) {
  const { collection } = await params

  if (!isAdminCollection(collection)) notFound()

  const type = collectionToEntityType[collection]
  const label = collectionLabels[collection]
  const singular = collectionSingularLabels[collection]

  return (
    <AdminShell
      title={`New ${singular}`}
      subtitle={`Create a new ${singular.toLowerCase()} entry`}
      backHref={`/admin/${collection}`}
      backLabel={`Back to ${label}`}
    >
      <AdminEntityForm
        mode="create"
        collection={collection}
        initial={{
          type,
          name: '',
          slug: '',
          description: '',
          status: 'published',
          data: {},
        }}
      />
    </AdminShell>
  )
}
