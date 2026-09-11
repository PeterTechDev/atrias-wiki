export type CharacterMedia = {
  type: 'image' | 'video'
  src: string
  alt?: string
  caption?: string
  credit?: string
  poster?: string
  captions?: string
}

export function isMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value.length > 2048 || /[\s\\]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
  } catch { return false }
}

export function validateCharacterMedia(value: unknown): asserts value is CharacterMedia[] {
  if (!Array.isArray(value) || value.length > 50) throw new Error('Adicione até 50 mídias por galeria.')
  for (const [index, item] of value.entries()) {
    const fail = (message: string) => { throw new Error(`Mídia ${index + 1}: ${message}`) }
    if (!item || typeof item !== 'object' || !['image', 'video'].includes(item.type)) fail('escolha imagem ou vídeo.')
    if (!isMediaUrl(item.src)) fail('informe um endereço http(s) ou um caminho local válido.')
    for (const key of ['alt', 'caption', 'credit']) {
      if (item[key] !== undefined && (typeof item[key] !== 'string' || item[key].length > 1000)) fail('use textos de até 1.000 caracteres.')
    }
    for (const key of ['poster', 'captions']) {
      if (item[key] && !isMediaUrl(item[key])) fail('o endereço da capa ou legenda é inválido.')
      if (item[key] !== undefined && typeof item[key] !== 'string') fail('o endereço da capa ou legenda deve ser um texto.')
    }
  }
}

export function getCharacterMedia(data: { media?: unknown; image?: unknown }, image?: string | null): CharacterMedia[] {
  if (Array.isArray(data.media)) {
    // An explicit empty collection removes the legacy portrait too.
    return data.media.filter((item): item is CharacterMedia => {
      try { validateCharacterMedia([item]); return true } catch { return false }
    }).slice(0, 50)
  }
  const src = isMediaUrl(data.image) ? data.image : image
  return isMediaUrl(src) ? [{ type: 'image', src }] : []
}
