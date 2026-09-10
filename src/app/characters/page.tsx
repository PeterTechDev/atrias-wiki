import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { CharacterData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('character')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as CharacterData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [data.titles?.[0], data.class, data.race, data.status, data.affiliation],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Personagens" subtitle="Heróis, vilões e todos entre eles" icon="game-icons:cowled" collection="characters" entries={entries} />
}
