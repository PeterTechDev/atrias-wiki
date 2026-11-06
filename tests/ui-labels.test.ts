import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHARACTER_STATUS_LABELS, labelCharacterStatus, uiCopy } from '../src/lib/uiLabels'

assert.equal(labelCharacterStatus('active'), 'Ativo')
assert.equal(labelCharacterStatus('deceased'), 'Falecido')
assert.equal(labelCharacterStatus('unknown'), 'Desconhecido')
assert.equal(labelCharacterStatus('missing'), 'Desaparecido')
assert.equal(labelCharacterStatus(' Active '), 'Ativo')
assert.equal(labelCharacterStatus('DECEASED'), 'Falecido')
assert.equal(labelCharacterStatus('Rei de Skeld'), 'Rei de Skeld')
assert.equal(labelCharacterStatus(''), undefined)
assert.equal(labelCharacterStatus(undefined), undefined)
assert.equal(labelCharacterStatus(null), undefined)
assert.deepEqual(Object.keys(CHARACTER_STATUS_LABELS), ['active', 'deceased', 'unknown', 'missing'])

assert.equal(uiCopy.witnessHistory, 'Testemunhar a História')
assert.equal(uiCopy.exploreTimeline, 'Explorar a linha do tempo')

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(join(root, path), 'utf8')
const characters = read('src/app/characters/page.tsx')
const detail = read('src/app/characters/[slug]/page.tsx')
const timeline = read('src/app/timeline/page.tsx')
const adminForm = read('src/app/admin/_components/AdminEntityForm.tsx')

assert.match(characters, /labelCharacterStatus\(data\.status\)/)
assert.doesNotMatch(characters, /metadata: \[data\.titles\?\.\[0\], data\.class, data\.race, data\.status,/)
assert.match(detail, /labelCharacterStatus\(data\.status\)/)
assert.doesNotMatch(detail, /const statusLabels/)
assert.match(timeline, /uiCopy\.witnessHistory/)
assert.match(timeline, /uiCopy\.exploreTimeline/)
assert.doesNotMatch(timeline, /Witness History/)
assert.doesNotMatch(timeline, /Explorar a Timeline/)
assert.match(adminForm, /CHARACTER_STATUS_LABELS/)
assert.doesNotMatch(adminForm, />Morto</)

console.log('ui labels: character status and timeline section titles ok')
