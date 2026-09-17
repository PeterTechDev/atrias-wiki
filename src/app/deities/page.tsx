import { getCharacterPortrait } from '@/lib/characterMedia'
import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { DeityData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('deity')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as DeityData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: getCharacterPortrait(e.data ?? {}, e.image)?.src, metadata: [data.domains?.[0], data.alignment],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Divindades" subtitle="Deuses, domínios e símbolos de Átrias" icon="game-icons:holy-symbol" collection="deities" entries={entries} />
}
