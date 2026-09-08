import assert from 'node:assert/strict'
import { mergeEntityData } from '../src/db/queries/entityEditing'

const merged = mergeEntityData(
  { imported: { keep: true }, combat: { ac: 12, hp: '20' }, oldField: 'preserve' },
  { combat: { ac: 14 }, oldField: undefined, absentList: [], absentFlag: false },
)

assert.deepEqual(merged, { imported: { keep: true }, combat: { ac: 14, hp: '20' } })
console.log('wiki editing data merge: ok')
