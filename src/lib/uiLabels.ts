/** Portuguese labels for stored UI values. Lore names stay as written. */

export const CHARACTER_STATUS_LABELS = {
  active: 'Ativo',
  deceased: 'Falecido',
  unknown: 'Desconhecido',
  missing: 'Desaparecido',
} as const

export type CharacterStatus = keyof typeof CHARACTER_STATUS_LABELS

export function labelCharacterStatus(status: string | null | undefined): string | undefined {
  const value = status?.trim()
  if (!value) return undefined
  const key = value.toLowerCase()
  if (key in CHARACTER_STATUS_LABELS) return CHARACTER_STATUS_LABELS[key as CharacterStatus]
  return value
}

export const uiCopy = {
  witnessHistory: 'Testemunhar a História',
  exploreTimeline: 'Explorar a linha do tempo',
} as const
