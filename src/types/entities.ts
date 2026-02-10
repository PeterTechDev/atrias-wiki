import type { Entity, EntityType } from '@/db/schema'

// Type-specific data structures
export interface CharacterData {
  race?: string
  class?: string
  alignment?: string
  affiliation?: string
  status?: string
  hierarchy?: string[]
  titles?: string[]
  abilities?: string[]
  weaknesses?: string[]
  combat?: {
    ac?: number
    hp?: string
    speed?: string
    attacks?: string[]
  }
}

export interface PlaceData {
  region?: string
  type?: string
  climate?: string
  population?: string
  government?: string
  function?: string
  design?: string
  notableLocations?: string[]
  map?: string
}

export interface FactionData {
  alignment?: string
  domains?: string[]
  portfolio?: string[]
  headquarters?: string
  leader?: string
  goals?: string[]
}

export interface ItemData {
  rarity?: string
  type?: string
  attunement?: boolean
  properties?: string[]
  effects?: string[]
}

export interface LoreData {
  category?: string
  era?: string
  dogma?: string[]
  proverbs?: string[]
  significance?: string
}

export interface MonsterData {
  cr?: string
  size?: string
  type?: string
  alignment?: string
  environment?: string[]
  abilities?: string[]
}

export interface SessionData {
  date?: string
  sessionNumber?: number
  players?: string[]
  summary?: string
  notableEvents?: string[]
}

// Helper to get typed data based on entity type
export type EntityDataMap = {
  character: CharacterData
  place: PlaceData
  faction: FactionData
  item: ItemData
  lore: LoreData
  monster: MonsterData
  session: SessionData
}

export type TypedEntity<T extends EntityType> = Omit<Entity, 'data'> & {
  data: EntityDataMap[T]
}

// Search result type - derived from Entity to prevent drift
export type SearchResult = Pick<Entity, 'id' | 'type' | 'slug' | 'name' | 'description'>

// Entity counts for homepage
export interface EntityCounts {
  characters: number
  places: number
  factions: number
  items: number
  lore: number
  monsters: number
  sessions: number
  total: number
}
