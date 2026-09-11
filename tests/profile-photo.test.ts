import assert from 'node:assert/strict'
import { profilePhotoError } from '../src/lib/profilePhoto'

for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
  assert.equal(profilePhotoError({ type, size: 2 * 1024 * 1024 }), '')
}
for (const file of [{ type: 'image/svg+xml', size: 100 }, { type: 'image/png', size: 2097153 }, { type: 'image/jpeg', size: 0 }]) {
  assert.ok(profilePhotoError(file))
}
console.log('Profile photo validation passed')
