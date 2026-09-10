import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { MonsterData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('monster')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as MonsterData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [data.type, data.environment?.[0]],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Bestiário" subtitle="Criaturas e monstros que habitam o mundo" icon="game-icons:spiked-dragon-head" collection="monsters" entries={entries} />
}
