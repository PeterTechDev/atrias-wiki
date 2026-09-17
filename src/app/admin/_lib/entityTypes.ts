import type { EntityType } from '@/db/schema'

export const adminCollections = [
  'characters',
  'factions',
  'places',
  'lore',
  'items',
  'monsters',
  'deities',
  'others',
] as const

export type AdminCollection = (typeof adminCollections)[number]

export const collectionToEntityType: Record<AdminCollection, EntityType> = {
  characters: 'character',
  factions: 'faction',
  places: 'place',
  lore: 'lore',
  items: 'item',
  monsters: 'monster',
  deities: 'deity',
  others: 'other',
}

export const collectionLabels: Record<AdminCollection, string> = {
  characters: 'Characters',
  factions: 'Factions',
  places: 'Places',
  lore: 'Lore',
  items: 'Items',
  monsters: 'Monsters',
  deities: 'Divindades',
  others: 'Outros',
}

export const collectionSingularLabels: Record<AdminCollection, string> = {
  characters: 'Character',
  factions: 'Faction',
  places: 'Place',
  lore: 'Lore Entry',
  items: 'Item',
  monsters: 'Monster',
  deities: 'Divindade',
  others: 'Outro',
}

export const entityTypeToCollection: Record<EntityType, string> = {
  character: 'characters', faction: 'factions', place: 'places', lore: 'lore',
  item: 'items', monster: 'monsters', other: 'others', deity: 'deities', session: 'sessions',
}

export function isAdminCollection(value: string): value is AdminCollection {
  return (adminCollections as readonly string[]).includes(value)
}
