import assert from 'node:assert/strict'
import { collectionToEntityType, entityTypeToCollection } from '../src/app/admin/_lib/entityTypes'
import { entityTypeEnum } from '../src/db/schema'

assert.ok(entityTypeEnum.includes('other'))
assert.equal(collectionToEntityType.others, 'other')
assert.equal(entityTypeToCollection.other, 'others')
console.log('wiki entity types: ok')
