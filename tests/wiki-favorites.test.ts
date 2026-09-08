import assert from 'node:assert/strict'
import { isEntityId } from '../src/lib/entityId'

assert.ok(isEntityId('11111111-1111-4111-8111-111111111111'))
assert.equal(isEntityId('not-an-id'), false)
console.log('wiki favorites payload checks passed')
