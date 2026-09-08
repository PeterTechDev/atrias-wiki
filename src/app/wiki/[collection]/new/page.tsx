import { notFound } from 'next/navigation'
import { getWikiRequestDM } from '@/lib/wikiRequest'
import { AdminEntityForm } from '@/app/admin/_components/AdminEntityForm'
import { AdminShell } from '@/app/admin/_components/AdminShell'
import { collectionLabels, collectionSingularLabels, collectionToEntityType, isAdminCollection } from '@/app/admin/_lib/entityTypes'

export default async function WikiNewEntityPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params
  if (!isAdminCollection(collection)) notFound()

  return (
    <AdminShell variant="wiki" title={`Adicionar ${collectionSingularLabels[collection]}`} subtitle={`Criar uma página em ${collectionLabels[collection]}`} backHref={`/${collection}`} backLabel={`Voltar para ${collectionLabels[collection]}`}>
      <AdminEntityForm
        isDM={await getWikiRequestDM()}
        mode="create"
        audience="member"
        collection={collection}
        enabled={process.env.WIKI_EDITING_ENABLED !== 'false'}
        initial={{ type: collectionToEntityType[collection], name: '', slug: '', description: '', status: 'published', data: {} }}
      />
    </AdminShell>
  )
}
