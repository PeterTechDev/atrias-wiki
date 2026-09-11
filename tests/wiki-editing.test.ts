import assert from 'node:assert/strict'
import { duplicateError, mergeEntityData } from '../src/db/queries/entityEditing'

const merged = mergeEntityData(
  { imported: { keep: true }, combat: { ac: 12, hp: '20' }, oldField: 'preserve' },
  { combat: { ac: 14 }, oldField: undefined, absentList: [], absentFlag: false },
)

assert.deepEqual(merged, { imported: { keep: true }, combat: { ac: 14, hp: '20' } })
const duplicate = Object.assign(new Error('duplicate key'), { code: '23505' })
assert.equal(duplicateError(duplicate), true)
assert.equal(duplicateError(new Error('Failed query', { cause: duplicate })), true)
assert.equal(duplicateError(new Error('Failed query: unique name', { cause: { code: '08006' } })), false)
assert.equal(duplicateError(null), false)
console.log('wiki editing data merge: ok')
