export type LocationCategory = 'local' | 'reino'

export const mapLocations = [
  // Key locations (Solária region)
  { name: 'Abrigo de Solária', coords: [2426, 4851], type: 'Vila', link: '/places/abrigo-de-solaria', description: 'Uma vila acolhedora nas Colinas do Serpeio', category: 'local' as LocationCategory },
  { name: 'Vigília de Akos', coords: [2812, 4630], type: 'Cidade', link: '/places/vigilia-de-akos', description: 'Cidade às portas da Mortalha Negra', category: 'local' as LocationCategory },
  { name: 'Pengram', coords: [2334, 5008], type: 'Cidade', link: null, description: 'Cidade ao sul, além das Colinas do Serpeio', category: 'local' as LocationCategory },
  { name: 'A Mortalha', coords: [2768, 4689], type: 'Floresta', link: '/places/mortalha', description: 'Floresta da Mortalha Negra — densa e cheia de mistérios', category: 'local' as LocationCategory },
  { name: 'Portão do Vale', coords: [2899, 4930], type: 'Fortaleza', link: null, description: 'Passagem fortificada ao sul da Mortalha', category: 'local' as LocationCategory },
  { name: 'Forte da Aliança', coords: [2686, 5048], type: 'Fortaleza', link: null, description: 'Forte estratégico, guardião das rotas comerciais', category: 'local' as LocationCategory },
  { name: 'Valtriunfo', coords: [2470, 4578], type: 'Cidade', link: null, description: 'Cidade ao norte, próxima à Grande Fonte de Aurun', category: 'local' as LocationCategory },
  // Reinos (kingdoms/major regions)
  { name: 'Skeld', coords: [4370, 1781], type: 'Reino', link: '/places/skeld', description: 'Reino ao norte', category: 'reino' as LocationCategory },
  { name: 'Skelligard', coords: [2817, 1495], type: 'Reino', link: null, description: 'Região gelada ao noroeste', category: 'reino' as LocationCategory },
  { name: 'Norbria', coords: [2359, 2824], type: 'Reino', link: '/places/norbria', description: 'Reino central', category: 'reino' as LocationCategory },
  { name: 'Humma', coords: [2786, 3263], type: 'Reino', link: '/places/humma', description: 'Reino ao centro-leste', category: 'reino' as LocationCategory },
  { name: 'Elendel', coords: [1723, 3642], type: 'Reino', link: '/places/elendel', description: 'Reino a oeste', category: 'reino' as LocationCategory },
  { name: 'Nerania', coords: [2554, 3865], type: 'Reino', link: null, description: 'Região central', category: 'reino' as LocationCategory },
  { name: 'Falandir', coords: [1724, 5003], type: 'Reino', link: '/places/falandir', description: 'Reino ao sudoeste', category: 'reino' as LocationCategory },
  { name: 'Zarkovia', coords: [2481, 5447], type: 'Reino', link: null, description: 'Reino ao sul', category: 'reino' as LocationCategory },
  { name: 'Ardanore', coords: [2588, 6211], type: 'Reino', link: null, description: 'Reino ao extremo sul', category: 'reino' as LocationCategory },
  { name: 'Zaoh', coords: [4396, 5923], type: 'Reino', link: null, description: 'Reino ao sudeste', category: 'reino' as LocationCategory },
  { name: 'Raruna', coords: [4845, 5176], type: 'Reino', link: null, description: 'Reino a leste', category: 'reino' as LocationCategory },
  { name: 'Kandar', coords: [6302, 5104], type: 'Reino', link: '/places/kandar', description: 'Reino ao extremo leste', category: 'reino' as LocationCategory },
].map(location => ({ ...location, id: location.link?.split('/').pop() || location.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-') }))

export function getPlaceMarker(data: { mapMarker?: string | null }, slug: string) {
  return mapLocations.find(location => data.mapMarker === undefined ? location.link === `/places/${slug}` : location.id === data.mapMarker)
}

export type MapLocation = typeof mapLocations[number] & { pages: { name: string; slug: string }[] }


