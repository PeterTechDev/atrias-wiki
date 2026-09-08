import { notFound } from 'next/navigation'
import { getEntityBySlug } from '@/db/queries/entities'
import { AdminEntityForm } from '@/app/admin/_components/AdminEntityForm'
import { AdminShell } from '@/app/admin/_components/AdminShell'
import { collectionSingularLabels, collectionToEntityType, isAdminCollection } from '@/app/admin/_lib/entityTypes'

export default async function WikiEditEntityPage({ params }: { params: Promise<{ collection: string; slug: string }> }) {
  const { collection, slug } = await params
  if (!isAdminCollection(collection)) notFound()

  const entity = await getEntityBySlug(collectionToEntityType[collection], slug)
  if (!entity) notFound()

  return (
    <AdminShell variant="wiki" title={`Editar ${collectionSingularLabels[collection]}`} subtitle={`Editar: ${entity.name}`} backHref={`/${collection}/${entity.slug}`} backLabel="Voltar para a página">
      <AdminEntityForm
        mode="edit"
        audience="member"
        collection={collection}
        enabled={process.env.WIKI_EDITING_ENABLED !== 'false'}
        initial={{ id: entity.id, type: entity.type, name: entity.name, slug: entity.slug, description: entity.description ?? '', status: entity.status ?? 'published', revision: entity.revision, data: (entity.data ?? {}) as Record<string, unknown> }}
      />
    </AdminShell>
  )
}
