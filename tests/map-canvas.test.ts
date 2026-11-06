// PET-101: the map canvas stays dark when Leaflet CSS is injected from a CDN
// after L.map() runs. Lock the bundled stylesheet and the image load/error gate.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/app/map/WorldMap.tsx', import.meta.url), 'utf8')

assert.match(source, /import 'leaflet\/dist\/leaflet\.css'/, 'Leaflet CSS must be bundled with the map')
assert.doesNotMatch(source, /unpkg\.com/, 'Map must not depend on a runtime CDN stylesheet')
assert.match(source, /overlay\.once\('load'/, 'Loading state must wait for the map image')
assert.match(source, /overlay\.once\('error'/, 'A failed map image must surface the recoverable error')

console.log('Map canvas regression passed.')
