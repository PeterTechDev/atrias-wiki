import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import DiceValues from '../src/app/dice/DiceValues'
import { DIE_SIDES } from '../src/lib/dice'

const html = renderToStaticMarkup(<DiceValues dice={DIE_SIDES.flatMap(sides => [{ sides, value: 1 }, { sides, value: sides }, { sides, value: 2 }])} />)
for (const sides of DIE_SIDES) {
  assert.ok(html.includes(`aria-label="d${sides}: 1 · ${sides === 20 ? '1 natural' : 'Mínimo'}"`))
  assert.ok(html.includes(`aria-label="d${sides}: ${sides} · ${sides === 20 ? '20 natural' : 'Máximo'}"`))
  assert.ok(html.includes(`aria-label="d${sides}: 2"`), 'Ordinary values are not marked as extremes')
}
assert.equal((html.match(/text-5xl/g) ?? []).length, 2, 'Both d20 extremes receive special emphasis in a mixed roll')
assert.equal((html.match(/<li /g) ?? []).length, 18, 'Keep every individual result, in order')
console.log('Dice values: all die extremes, ordinary values and simultaneous d20 naturals passed.')
