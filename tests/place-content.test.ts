import assert from 'node:assert/strict'
import { getPlaceContent, getPlaceMaps, parsePlaceDescription, validatePlaceData } from '../src/lib/placeContent'
import { getPlaceMarker } from '../src/lib/mapLocations'
import { mergeEntityData } from '../src/db/queries/entityEditing'

const imported = 'Uma vila.\r\nOutro parágrafo.\r\nGOVERNO\r\nUm conselho.\r\nCOMÉRCIO\r\nUma feira.'
assert.deepEqual(parsePlaceDescription(imported), { intro: 'Uma vila.\nOutro parágrafo.', sections: [{ title: 'Governo', content: 'Um conselho.' }, { title: 'Comércio', content: 'Uma feira.' }] })
assert.equal(getPlaceContent({ sections: [] }, imported).intro, imported, 'Explicit sections must not reparse editorial content')
assert.deepEqual(getPlaceMaps({ maps: [], map: '/legacy.png' }), [], 'Removing maps must not resurrect the legacy map')
assert.equal(getPlaceMarker({}, 'abrigo-de-solaria')?.id, 'abrigo-de-solaria')
assert.equal(getPlaceMarker({ mapMarker: null }, 'abrigo-de-solaria'), undefined, 'Explicitly unlinked places must remain unlinked')
assert.equal(getPlaceMarker({ mapMarker: 'abrigo-de-solaria' }, 'another-place')?.id, 'abrigo-de-solaria')
const data = { sections: [{ title: 'História', content: 'Texto.' }], residents: [{ name: 'Aric', characterSlug: 'barao-aric-valtor' }], media: [{ type: 'image', src: '/photo.png' }], maps: [], mapMarker: null }
validatePlaceData(data)
assert.throws(() => validatePlaceData({ notableLocations: { name: 'Inválido' } }))
assert.throws(() => validatePlaceData({ notableLocations: [123] }))
for (const invalid of [{ residents: [{ name: 'X', characterSlug: '../../admin' }] }, { residents: [{ name: 'X', image: 'javascript:alert(1)' }] }, { sections: [{ title: '', content: 'Texto' }] }, { sections: Array(31).fill({ title: 'X', content: 'Y' }) }, { maps: [{ type: 'video', src: '/movie.mp4' }] }, { media: [{ type: 'image', src: 'https://user:pass@example.com/a.png' }] }]) assert.throws(() => validatePlaceData(invalid))
const edited = mergeEntityData({ ...data, imported: { keep: true }, region: 'Antiga' }, { sections: [], residents: [], media: [], maps: [], region: '', mapMarker: null })
assert.deepEqual(edited, { sections: [], residents: [], media: [], maps: [], region: '', mapMarker: null, imported: { keep: true } })
console.log('place content: imports, optional map, references, validation and removal passed')
