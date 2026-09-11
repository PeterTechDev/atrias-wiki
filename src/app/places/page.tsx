import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { PlaceData } from '@/types/entities'
import { getCharacterMedia } from '@/lib/characterMedia'
import { getPlaceMaps } from '@/lib/placeContent'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('place')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as PlaceData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: getCharacterMedia(data, e.image).find(item => item.type === 'image')?.src || getPlaceMaps(data)[0]?.src, metadata: [data.type, data.region],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Lugares" subtitle="Reinos, cidades e terras misteriosas" icon="game-icons:castle" collection="places" entries={entries} />
}
