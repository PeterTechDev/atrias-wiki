import assert from 'node:assert/strict'
import { collectionToEntityType, entityTypeToCollection } from '../src/app/admin/_lib/entityTypes'
import { entityTypeEnum } from '../src/db/schema'

assert.ok(entityTypeEnum.includes('other'))
assert.equal(collectionToEntityType.others, 'other')
assert.equal(entityTypeToCollection.other, 'others')
assert.ok(entityTypeEnum.includes('deity'))
assert.equal(collectionToEntityType.deities, 'deity')
assert.equal(entityTypeToCollection.deity, 'deities')
console.log('wiki entity types: ok')
