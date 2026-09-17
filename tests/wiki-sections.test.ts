import assert from 'node:assert/strict'
import { getWikiSections, moveWikiSection, validateWikiSections } from '../src/lib/wikiSections'
import { getPlaceContent, validatePlaceData } from '../src/lib/placeContent'
import { mergeEntityData } from '../src/db/queries/entityEditing'

const sections = [{ title: 'História', content: 'Primeiro parágrafo.\n\nSegundo parágrafo.' }, { title: 'Cultura', content: '[Átrias](/places/atrias)' }]
const reordered = moveWikiSection(sections, 1, -1)
assert.deepEqual(reordered, [sections[1], sections[0]])
assert.deepEqual(moveWikiSection(reordered, 0, 1), sections)
assert.equal(moveWikiSection(sections, 0, -1), sections)
assert.equal(moveWikiSection(sections, 1, 1), sections)
assert.equal(sections[0].title, 'História')
validateWikiSections(sections)
validateWikiSections(undefined)
validateWikiSections([])
for (const invalid of [null, {}, [null], [{ title: '', content: 'Texto' }], [{ title: 'Título', content: ' ' }], [{ title: 'x'.repeat(121), content: 'Texto' }], [{ title: 'Título', content: 'x'.repeat(50001) }], Array(31).fill(sections[0]), Array(11).fill({ title: 'Título', content: 'x'.repeat(50000) })]) {
  assert.throws(() => validateWikiSections(invalid))
  assert.throws(() => validatePlaceData({ sections: invalid }))
}
const saved = JSON.parse(JSON.stringify(mergeEntityData({ imported: true, sections }, { sections: reordered })))
assert.deepEqual(getWikiSections(saved), reordered)
assert.equal(saved.imported, true)
assert.deepEqual(getWikiSections(mergeEntityData(saved, { sections: [] })), [])
assert.deepEqual(getWikiSections({}), [])
assert.deepEqual(getPlaceContent({}, 'Introdução\nHISTÓRIA\nTexto antigo'), { intro: 'Introdução', sections: [{ title: 'História', content: 'Texto antigo' }] })
console.log('wiki sections: ordering, persistence, legacy content and validation passed')
