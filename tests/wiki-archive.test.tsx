import assert from 'node:assert/strict'
import { filterArchiveEntries } from '../src/components/WikiArchiveList'

const entries = [
  { slug: 'atrias', name: 'Átrias', description: null },
  { slug: 'alan', name: 'Alan Kendra', description: 'Átrias' },
]
assert.deepEqual(filterArchiveEntries(entries, ' ATRIAS '), [entries[0]])
assert.deepEqual(filterArchiveEntries(entries, 'kEnDrA'), [entries[1]])
assert.deepEqual(filterArchiveEntries(entries, '   '), entries)
assert.deepEqual(filterArchiveEntries(entries, 'inexistente'), [])
assert.deepEqual(filterArchiveEntries([], 'alan'), [])
console.log('Archive search checks passed')
