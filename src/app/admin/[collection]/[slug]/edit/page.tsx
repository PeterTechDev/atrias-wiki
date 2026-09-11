import { notFound } from 'next/navigation'
import { getWikiRequestDM } from '@/lib/wikiRequest'
import { getEntityBySlug } from '@/db/queries/entities'
import { AdminShell } from '@/app/admin/_components/AdminShell'
import { AdminEntityForm } from '@/app/admin/_components/AdminEntityForm'
import { collectionLabels, collectionSingularLabels, collectionToEntityType, isAdminCollection } from '@/app/admin/_lib/entityTypes'

export default async function AdminEditEntityPage({
  params,
}: {
  params: Promise<{ collection: string; slug: string }>
}) {
  const { collection, slug } = await params

  if (!isAdminCollection(collection)) notFound()

  const type = collectionToEntityType[collection]
  const entity = await getEntityBySlug(type, slug)

  if (!entity) notFound()

  const label = collectionLabels[collection]
  const singular = collectionSingularLabels[collection]

  return (
    <AdminShell
      title={`Edit ${singular}`}
      subtitle={`Editing: ${entity.name}`}
      backHref={`/admin/${collection}`}
      backLabel={`Back to ${label}`}
    >
      <AdminEntityForm
        isDM={await getWikiRequestDM()}
        mode="edit"
        collection={collection}
        initial={{
          id: entity.id,
          image: entity.image,
          type: entity.type,
          name: entity.name,
          slug: entity.slug,
          description: entity.description ?? '',
          status: entity.status ?? 'published',
          revision: entity.revision,
          isSpoiler: entity.isSpoiler === true,
          data: (entity.data ?? {}) as Record<string, unknown>,
        }}
      />
    </AdminShell>
  )
}
