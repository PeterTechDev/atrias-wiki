import assert from 'node:assert/strict'
import { normalizeArchivedIds } from '../src/db/queries/entityEditing'

const first = '11111111-1111-4111-8111-111111111111'
const second = '22222222-2222-4222-8222-222222222222'
assert.deepEqual(normalizeArchivedIds([first, first, second]), [first, second])
assert.throws(() => normalizeArchivedIds([]), /valid UUIDs/)
assert.throws(() => normalizeArchivedIds(['invalid']), /valid UUIDs/)
console.log('wiki archiving payload checks passed')
