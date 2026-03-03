import { NextResponse } from 'next/server'
import { db } from '@/db'
import { entities, entityRelations } from '@/db/schema'

export const dynamic = 'force-dynamic'

export type GraphNode = {
  id: string
  slug: string
  name: string
  type: string
}

export type GraphEdge = {
  sourceId: string
  targetId: string
  relationshipType: string
}

function sampleGraph() {
  // Safe fallback so the Graph page is usable even without a configured DB.
  const nodes: GraphNode[] = [
    { id: 'c:ayla', slug: 'ayla', name: 'Ayla', type: 'character' },
    { id: 'c:draven', slug: 'draven', name: 'Draven', type: 'character' },
    { id: 'f:ember-order', slug: 'ember-order', name: 'Ember Order', type: 'faction' },
    { id: 'p:old-harbor', slug: 'old-harbor', name: 'Old Harbor', type: 'place' },
    { id: 'i:sun-coin', slug: 'sun-coin', name: 'Sun Coin', type: 'item' },
    { id: 'm:marsh-wyrm', slug: 'marsh-wyrm', name: 'Marsh Wyrm', type: 'monster' },
    { id: 'l:oath-of-ash', slug: 'oath-of-ash', name: 'Oath of Ash', type: 'lore' },
  ]

  const edges: GraphEdge[] = [
    { sourceId: 'c:ayla', targetId: 'f:ember-order', relationshipType: 'member of' },
    { sourceId: 'c:draven', targetId: 'p:old-harbor', relationshipType: 'born in' },
    { sourceId: 'c:ayla', targetId: 'p:old-harbor', relationshipType: 'visited' },
    { sourceId: 'c:draven', targetId: 'm:marsh-wyrm', relationshipType: 'hunted' },
    { sourceId: 'i:sun-coin', targetId: 'l:oath-of-ash', relationshipType: 'mentioned in' },
    { sourceId: 'f:ember-order', targetId: 'l:oath-of-ash', relationshipType: 'follows' },
  ]

  return { nodes, edges }
}

export async function GET() {
  try {
    const nodes = await db
      .select({
        id: entities.id,
        slug: entities.slug,
        name: entities.name,
        type: entities.type,
      })
      .from(entities)

    const edges = await db
      .select({
        sourceId: entityRelations.sourceId,
        targetId: entityRelations.targetId,
        relationshipType: entityRelations.relationType,
      })
      .from(entityRelations)

    // If the DB exists but has no relations yet, show a small example so the page isn't empty.
    if (!nodes.length || !edges.length) {
      return NextResponse.json(sampleGraph())
    }

    return NextResponse.json({ nodes, edges })
  } catch (err: unknown) {
    // DB not configured or connection failure: fall back to sample data.
    const details =
      process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined

    return NextResponse.json({ ...sampleGraph(), _warning: 'db_unavailable', details })
  }
}
