import assert from 'node:assert/strict'
import { getCharacterMedia, isMediaUrl, validateCharacterMedia } from '../src/lib/characterMedia'
import { mergeEntityData } from '../src/db/queries/entityEditing'

const image = { type: 'image', src: '/images/characters/thaveus.webp', alt: 'Thaveus escrevendo' }
const video = { type: 'video', src: 'https://example.com/scene.mp4', poster: image.src, captions: '/scene.vtt' }
validateCharacterMedia([image, video])
assert.deepEqual(getCharacterMedia({}, image.src), [{ type: 'image', src: image.src }])
assert.deepEqual(getCharacterMedia({ image: '/edited.webp' }, image.src), [{ type: 'image', src: '/edited.webp' }])
assert.deepEqual(getCharacterMedia({ media: [video, image] }, image.src), [video, image])
const removed = mergeEntityData({ image: image.src, race: 'Zeitgeist' }, { media: [] })
assert.deepEqual(getCharacterMedia(removed, image.src), [])
assert.equal(removed.race, 'Zeitgeist')
assert.deepEqual(mergeEntityData({ media: [image, video] }, { class: 'Escriba' }).media, [image, video])
assert.deepEqual(getCharacterMedia({ media: [null, image, { type: 'video', src: 'javascript:alert(1)' }] }), [image])
for (const src of ['javascript:alert(1)', 'data:image/svg+xml,test', '//evil.test/a', '/\\evil.test/a', 'https://user:password@example.com/a', '/image with spaces.png']) {
  assert.equal(isMediaUrl(src), false, src)
  assert.throws(() => validateCharacterMedia([{ ...image, src }]))
}
for (const value of [null, {}, [null], [{ ...image, type: 'iframe' }], [{ ...video, poster: {} }], [{ ...image, alt: 'a'.repeat(1001) }], Array(51).fill(image)]) {
  assert.throws(() => validateCharacterMedia(value))
}
console.log('character media: validation, legacy fallback, ordering and removal ok')
