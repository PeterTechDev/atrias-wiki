import type { EntityType } from '@/db/schema'

export const adminCollections = [
  'characters',
  'factions',
  'places',
  'lore',
  'items',
  'monsters',
] as const

export type AdminCollection = (typeof adminCollections)[number]

export const collectionToEntityType: Record<AdminCollection, EntityType> = {
  characters: 'character',
  factions: 'faction',
  places: 'place',
  lore: 'lore',
  items: 'item',
  monsters: 'monster',
}

export const collectionLabels: Record<AdminCollection, string> = {
  characters: 'Characters',
  factions: 'Factions',
  places: 'Places',
  lore: 'Lore',
  items: 'Items',
  monsters: 'Monsters',
}

export const collectionSingularLabels: Record<AdminCollection, string> = {
  characters: 'Character',
  factions: 'Faction',
  places: 'Place',
  lore: 'Lore Entry',
  items: 'Item',
  monsters: 'Monster',
}

export function isAdminCollection(value: string): value is AdminCollection {
  return (adminCollections as readonly string[]).includes(value)
}
