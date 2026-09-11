import { notFound } from 'next/navigation'
import { getWikiRequestDM } from '@/lib/wikiRequest'
import { AdminEntityForm } from '@/app/admin/_components/AdminEntityForm'
import { AdminShell } from '@/app/admin/_components/AdminShell'
import { collectionToEntityType, isAdminCollection } from '@/app/admin/_lib/entityTypes'

export default async function WikiNewEntityPage({ params, searchParams }: { params: Promise<{ collection: string }>; searchParams: Promise<{ name?: string }> }) {
  const { collection } = await params
  const query = await searchParams
  const name = typeof query.name === 'string' ? query.name.slice(0, 200) : ''
  const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!isAdminCollection(collection)) notFound()

  return (
    <AdminShell variant="wiki" title="Criar página" subtitle="Registre o que você sabe sobre Átrias. Você pode complementar depois." backHref="/browse" backLabel="Voltar para a wiki" compact>
      <AdminEntityForm
        isDM={await getWikiRequestDM()}
        mode="create"
        audience="member"
        collection={collection}
        enabled={process.env.WIKI_EDITING_ENABLED !== 'false'}
        initial={{ type: collectionToEntityType[collection], name, slug, description: '', status: 'published', data: {} }}
      />
    </AdminShell>
  )
}
