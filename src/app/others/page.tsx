import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('other')
  const entries = entities.map((e) => {
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Outros" subtitle="Registros que não se encaixam nas outras categorias" icon="game-icons:archive-register" collection="others" entries={entries} />
}
