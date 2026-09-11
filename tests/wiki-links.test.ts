import assert from 'node:assert/strict'
import { insertWikiLink, parseWikiLinks, wikiLinkText } from '../src/lib/wikiLinks'

const story = 'Idris veio do Abrigo de Solária.\nOutra linha.'
const start = story.indexOf('Abrigo')
const end = story.indexOf('.')
const linked = insertWikiLink(story, start, end, 'Outro nome', '/places/abrigo-de-solaria')
assert.equal(linked.value, 'Idris veio do [Abrigo de Solária](/places/abrigo-de-solaria).\nOutra linha.')
assert.equal(wikiLinkText(linked.value), story)
assert.equal(linked.value.slice(linked.cursor), '.\nOutra linha.')
assert.deepEqual(parseWikiLinks(linked.value)[1], { text: 'Abrigo de Solária', href: '/places/abrigo-de-solaria' })
assert.equal(insertWikiLink('Oi ', 3, 3, 'Idris', '/characters/idris').value, 'Oi [Idris](/characters/idris)')
assert.equal(wikiLinkText(insertWikiLink('', 0, 0, 'Nome [antigo] \\', '/lore/nome').value), 'Nome [antigo] \\')
for (const href of ['javascript:alert(1)', '//evil.test', 'https://evil.test', '/places/../admin', '/places/a/extra', '/places/a?x=1']) {
  const text = `[link](${href})`
  assert.deepEqual(parseWikiLinks(text), [{ text }])
}
assert.equal(parseWikiLinks('[A](/places/a) e [B](/items/b)').filter(part => part.href).length, 2)
assert.equal(wikiLinkText('Texto [incompleto e <script>alert(1)</script>'), 'Texto [incompleto e <script>alert(1)</script>')
console.log('Wiki links: OK')
