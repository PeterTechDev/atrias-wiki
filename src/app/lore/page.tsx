import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { LoreData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('lore')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as LoreData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [data.category, data.era],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Conhecimento" subtitle="História, lendas e conhecimento antigo" icon="game-icons:scroll-unfurled" collection="lore" entries={entries} />
}
