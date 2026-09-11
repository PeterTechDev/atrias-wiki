import { getCharacterMedia, isMediaUrl, validateCharacterMedia, type CharacterMedia } from './characterMedia'

export type PlaceSection = { title: string; content: string }
export type PlaceResident = { name: string; role?: string; description?: string; image?: string; characterSlug?: string }

// Older imports use standalone uppercase headings and single newlines.
export function parsePlaceDescription(description: string) {
  const sections: PlaceSection[] = []
  const intro: string[] = []
  for (const line of description.replace(/\r\n?/g, '\n').split('\n')) {
    const text = line.trim()
    if (/^(HIST[ÓO]RIA|GEOGRAFIA|GOVERNO|COM[ÉE]RCIO|DEFESAS|CULTURA(?: E SOCIEDADE)?|NPCS NOT[ÁA]VEIS|LOCAIS NOT[ÁA]VEIS)$/.test(text)) {
      sections.push({ title: text.charAt(0) + text.slice(1).toLocaleLowerCase('pt-BR'), content: '' })
    } else if (sections.length) {
      sections[sections.length - 1].content += `${line}\n`
    } else intro.push(line)
  }
  return { intro: intro.join('\n').trim(), sections: sections.map(section => ({ ...section, content: section.content.trim() })) }
}

export function getPlaceContent(data: { sections?: PlaceSection[] }, description: string) {
  return Array.isArray(data.sections) ? { intro: description, sections: data.sections } : parsePlaceDescription(description)
}

export function getPlaceMaps(data: { maps?: CharacterMedia[]; map?: string }) {
  return getCharacterMedia({ media: data.maps, image: data.map }).filter(item => item.type === 'image')
}

export function validatePlaceData(data: Record<string, unknown>) {
  for (const key of ['type', 'region', 'population', 'government', 'climate', 'function', 'design']) {
    if (data[key] !== undefined && (typeof data[key] !== 'string' || data[key].length > 5000)) throw new Error('Use textos de até 5.000 caracteres na ficha do lugar.')
  }
  for (const key of ['media', 'maps']) {
    if (data[key] !== undefined) validateCharacterMedia(data[key])
  }
  if (Array.isArray(data.maps) && data.maps.some(item => item.type !== 'image')) throw new Error('Adicione mapas como imagens.')
  if (data.mapMarker !== undefined && data.mapMarker !== null && (typeof data.mapMarker !== 'string' || !/^[a-z0-9-]{1,160}$/.test(data.mapMarker))) throw new Error('Escolha uma localização válida no mapa.')
  if (data.notableLocations !== undefined && (!Array.isArray(data.notableLocations) || data.notableLocations.length > 100 || data.notableLocations.some(item => typeof item !== 'string' || item.length > 5000))) throw new Error('Adicione até 100 locais de interesse, com até 5.000 caracteres cada.')
  if (data.sections !== undefined) {
    if (!Array.isArray(data.sections) || data.sections.length > 30) throw new Error('Adicione até 30 seções por lugar.')
    for (const section of data.sections) {
      if (!section || typeof section.title !== 'string' || !section.title.trim() || section.title.length > 120 || typeof section.content !== 'string' || !section.content.trim() || section.content.length > 50000) throw new Error('Cada seção precisa de título (até 120 caracteres) e texto (até 50.000 caracteres).')
    }
  }
  if (data.residents !== undefined) {
    if (!Array.isArray(data.residents) || data.residents.length > 100) throw new Error('Adicione até 100 pessoas por lugar.')
    for (const resident of data.residents) {
      if (!resident || typeof resident.name !== 'string' || !resident.name.trim() || resident.name.length > 200) throw new Error('Informe o nome de cada pessoa (até 200 caracteres).')
      for (const key of ['role', 'description']) {
        if (resident[key] !== undefined && (typeof resident[key] !== 'string' || resident[key].length > 5000)) throw new Error('Use descrições de até 5.000 caracteres por pessoa.')
      }
      if (resident.image !== undefined && (typeof resident.image !== 'string' || (resident.image && !isMediaUrl(resident.image)))) throw new Error('Informe um endereço de imagem válido para a pessoa.')
      if (resident.characterSlug !== undefined && (typeof resident.characterSlug !== 'string' || (resident.characterSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resident.characterSlug)) || resident.characterSlug.length > 160)) throw new Error('Escolha uma página de personagem válida.')
    }
  }
  if (JSON.stringify(data).length > 500000) throw new Error('O conteúdo do lugar excede o limite de 500.000 caracteres.')
}
