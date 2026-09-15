import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import RollSlider, { slideDistance } from '../src/app/dice/RollSlider'

assert.equal(slideDistance(200, 230), 0, 'Dragging down cannot launch')
assert.equal(slideDistance(200, 171), 29, 'A short upward drag stays below the launch threshold')
assert.equal(slideDistance(200, 170), 30, 'The release threshold is reachable')
assert.equal(slideDistance(200, -100), 40, 'The handle stays inside its track')
assert.equal(slideDistance(200, 200), 0, 'Dragging back to the start cancels the launch')
const html = renderToStaticMarkup(<RollSlider disabled busy onRoll={() => { throw new Error('Rendering must not roll') }} />)
assert.equal((html.match(/disabled=""/g) ?? []).length, 2, 'Both drag and tap controls lock while rolling')
assert.match(html, /aria-label="Rolar os dados"/)
assert.match(html, /Ou toque para rolar/)
console.log('Dice slider: direction, threshold, bounds, reversal and disabled controls passed.')
