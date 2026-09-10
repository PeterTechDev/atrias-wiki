import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { ItemData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('item')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as ItemData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [data.type, data.rarity],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Itens" subtitle="Artefatos, armas e tesouros mágicos" icon="game-icons:swap-bag" collection="items" entries={entries} />
}
