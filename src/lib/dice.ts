export const DIE_SIDES = [4, 6, 8, 10, 12, 20] as const
export type DieSides = typeof DIE_SIDES[number]
export type DicePool = Partial<Record<DieSides, number>>
export type DiceCombination = { pool: DicePool; modifier: number }
export type DiceResult = { sides: DieSides; value: number }
export type DiceRoll = DiceCombination & { id: string; at: string; dice: DiceResult[]; total: number }
export type DiceFavorite = DiceCombination & { id: string; name: string }
export const MAX_DICE = 24
export const HISTORY_LIMIT = 100
export const FAVORITES_LIMIT = 30
export const DICE_STORAGE_KEY = 'atrias:dice:v1'

export function diceCount(pool: DicePool) {
  return DIE_SIDES.reduce((total, sides) => total + (pool[sides] ?? 0), 0)
}

export function notation({ pool, modifier }: DiceCombination) {
  const dice = DIE_SIDES.filter(sides => pool[sides]).map(sides => `${pool[sides]}d${sides}`).join(' + ')
  return `${dice || 'Nenhum dado'}${modifier ? ` ${modifier > 0 ? '+' : '−'} ${Math.abs(modifier)}` : ''}`
}

export function validCombination(value: unknown): value is DiceCombination {
  if (!value || typeof value !== 'object') return false
  const { pool, modifier } = value as DiceCombination
  return !!pool && typeof pool === 'object' && !Array.isArray(pool)
    && Object.entries(pool).every(([sides, count]) => DIE_SIDES.includes(Number(sides) as DieSides) && Number.isInteger(count) && count >= 0 && count <= MAX_DICE)
    && diceCount(pool) > 0 && diceCount(pool) <= MAX_DICE
    && Number.isInteger(modifier) && Math.abs(modifier) <= 999
}

export function parseNotation(input: string): DiceCombination {
  const text = input.toLowerCase().replace(/\s+/g, '')
  if (text.length > 200 || !/^(?:\d+d\d+)(?:\+\d+d\d+)*(?:[+-]\d+)?$/.test(text)) {
    throw new Error('Use uma combinação como 2d6 + 4d8 + 3.')
  }
  const pool: DicePool = {}
  let modifier = 0
  for (const term of text.match(/[+-]?\d+(?:d\d+)?/g) ?? []) {
    if (term.includes('d')) {
      const [count, sides] = term.replace(/^\+/, '').split('d').map(Number)
      if (!DIE_SIDES.includes(sides as DieSides) || count < 1) throw new Error('Escolha d4, d6, d8, d10, d12 ou d20, com quantidade maior que zero.')
      pool[sides as DieSides] = (pool[sides as DieSides] ?? 0) + count
    } else modifier = Number(term)
  }
  const combination = { pool, modifier }
  if (!validCombination(combination)) throw new Error(`Use até ${MAX_DICE} dados e um modificador entre −999 e +999.`)
  return combination
}

export function readDiceStorage(raw: string | null): { history: DiceRoll[]; favorites: DiceFavorite[] } {
  if (!raw) return { history: [], favorites: [] }
  const data = JSON.parse(raw)
  if (!data || !Array.isArray(data.history) || !Array.isArray(data.favorites)) throw new Error('Dados salvos inválidos.')
  const favorites = data.favorites.filter((item: DiceFavorite) => validCombination(item) && typeof item.id === 'string' && typeof item.name === 'string' && item.name.length <= 60).slice(0, FAVORITES_LIMIT)
  const history = data.history.filter((item: DiceRoll) => validCombination(item) && typeof item.id === 'string' && typeof item.at === 'string' && Number.isFinite(Date.parse(item.at))
    && Array.isArray(item.dice) && item.dice.length === diceCount(item.pool)
    && item.dice.every(die => die && DIE_SIDES.includes(die.sides) && Number.isInteger(die.value) && die.value >= 1 && die.value <= die.sides)
    && DIE_SIDES.every(sides => item.dice.filter(die => die.sides === sides).length === (item.pool[sides] ?? 0))
    && item.total === item.dice.reduce((sum, die) => sum + die.value, item.modifier)).slice(0, HISTORY_LIMIT)
  return { history, favorites }
}

export function motionStrength(event: Pick<DeviceMotionEvent, 'acceleration' | 'accelerationIncludingGravity' | 'rotationRate'>) {
  const acceleration = event.acceleration
  const gravity = event.accelerationIncludingGravity
  const magnitude = (value: DeviceMotionEventAcceleration | null) => value ? Math.hypot(value.x ?? 0, value.y ?? 0, value.z ?? 0) : 0
  const linear = acceleration && [acceleration.x, acceleration.y, acceleration.z].some(v => v !== null)
    ? magnitude(acceleration) : Math.max(0, magnitude(gravity) - 9.81)
  const rotation = event.rotationRate
  const spin = rotation ? Math.hypot(rotation.alpha ?? 0, rotation.beta ?? 0, rotation.gamma ?? 0) : 0
  return Number.isFinite(linear + spin) ? linear + Math.min(spin / 60, 5) : 0
}
