import assert from 'node:assert/strict'
import { confirmDiscard, shouldConfirmNavigation, unsavedChangesMessage } from '../src/lib/unsavedChanges'

const current = 'http://localhost:3000/wiki/characters/idris/edit'
assert.equal(shouldConfirmNavigation(current, '#description'), false)
assert.equal(shouldConfirmNavigation(current, current), false)
assert.equal(shouldConfirmNavigation(current, '/places/abrigo-de-solaria'), true)
assert.equal(shouldConfirmNavigation(current, '?other=1'), true)
assert.equal(shouldConfirmNavigation(current, 'https://example.com'), true)
assert.equal(confirmDiscard(false, () => { throw new Error('Clean forms must not prompt') }), true)
assert.equal(confirmDiscard(true, message => { assert.equal(message, unsavedChangesMessage); return false }), false)
assert.equal(confirmDiscard(true, () => true), true)
console.log('Unsaved changes: OK')
