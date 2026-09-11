import assert from 'node:assert/strict'
import { getCharacterCard, validateCharacterCard } from '../src/lib/characterCard'
import { mergeEntityData } from '../src/db/queries/entityEditing'

const card = { foreground: '/images/characters/idris-3d-foreground.webp', background: '/images/characters/idris-3d-background.webp', alt: 'Idris com espada e escudo' }
validateCharacterCard(card)
assert.deepEqual(getCharacterCard(card), card)
assert.equal(getCharacterCard(undefined), null)
assert.equal(getCharacterCard(null), null)
for (const invalid of [[], [card], [card, card], '', false, {}, { ...card, foreground: 'javascript:alert(1)' }, { ...card, background: '//evil.test/a' }, { ...card, alt: 3 }, { ...card, credit: 'a'.repeat(1001) }]) {
  assert.throws(() => validateCharacterCard(invalid))
  assert.equal(getCharacterCard(invalid), null)
}
const original = { card3d: card, media: [{ type: 'image', src: '/portrait.jpg' }], race: 'Humano' }
assert.deepEqual(mergeEntityData(original, { race: 'Elfo' }).card3d, card)
const removed = mergeEntityData(original, { card3d: null })
assert.equal(getCharacterCard(removed.card3d), null)
assert.deepEqual(removed.media, original.media)
assert.equal(removed.race, original.race)
assert.deepEqual(mergeEntityData(removed, { card3d: card }).card3d, card)
console.log('character card: one optional card, URL/text validation, preservation and removal ok')
