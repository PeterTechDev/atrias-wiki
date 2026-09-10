import { getEntitiesByType } from '@/db/queries/entities'
import { WikiArchive } from '@/components/WikiArchive'
import type { FactionData } from '@/types/entities'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const entities = await getEntitiesByType('faction')
  const entries = entities.map((e) => {
    const data = (e.data ?? {}) as FactionData
    return {
      slug: e.slug, name: e.name, description: e.description,
      image: e.image, metadata: [data.domains?.[0], data.alignment],
    }
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  return <WikiArchive title="Facções" subtitle="Ordens, guildas e organizações do mundo" icon="game-icons:rally-the-troops" collection="factions" entries={entries} />
}
