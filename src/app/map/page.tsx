import { getEntitiesByType } from '@/db/queries/entities'
import { mapLocations, getPlaceMarker } from '@/lib/mapLocations'
import type { PlaceData } from '@/types/entities'
import WorldMap from './WorldMap'

export const dynamic = 'force-dynamic'

export default async function MapPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const [places, params] = await Promise.all([getEntitiesByType('place'), searchParams])
  const locations = mapLocations.map(location => ({ ...location, pages: places.filter(place => getPlaceMarker(place.data as PlaceData ?? {}, place.slug)?.id === location.id).map(place => ({ name: place.name, slug: place.slug })) }))
  return <WorldMap locations={locations} initialPlace={typeof params.place === 'string' ? params.place : undefined} />
}
