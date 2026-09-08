import assert from 'node:assert/strict'
import { signupPasswordError } from '../src/lib/signupPassword'

assert.equal(signupPasswordError('12345678', '12345678'), '')
assert.equal(signupPasswordError('12345678', '12345679'), 'As senhas não coincidem.')
assert.equal(signupPasswordError('SenhaAa1', 'SenhaAa1 '), 'As senhas não coincidem.')
assert.equal(signupPasswordError('', ''), '')

console.log('signup password checks passed')
