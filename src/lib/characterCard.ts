import { isMediaUrl } from './characterMedia'

export type CharacterCard = {
  foreground: string
  background: string
  alt?: string
  credit?: string
}

export function validateCharacterCard(value: unknown): asserts value is CharacterCard | null | undefined {
  if (value === null || value === undefined) return
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Adicione apenas um card 3D por personagem.')
  const card = value as Record<string, unknown>
  if (!isMediaUrl(card.foreground) || !isMediaUrl(card.background)) throw new Error('Card 3D: informe os endereços do personagem e do fundo.')
  for (const key of ['alt', 'credit']) {
    if (card[key] !== undefined && (typeof card[key] !== 'string' || card[key].length > 1000)) throw new Error('Card 3D: use textos de até 1.000 caracteres.')
  }
}

export function getCharacterCard(value: unknown): CharacterCard | null {
  try { validateCharacterCard(value); return value ?? null } catch { return null }
}
