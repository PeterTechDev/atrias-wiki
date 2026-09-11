// Run with the local dev server: node tests/faction-page.test.mjs
import assert from 'node:assert/strict'

const response = await fetch('http://localhost:3000/factions/improvaveis-de-solaria')
assert.equal(response.status, 200)
const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
assert.match(html, /<h1[^>]*>Improváveis de Solária<\/h1>/)
const story = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0]
assert.ok(story, 'The story must be separate from the identity header')
assert.equal((story.match(/<p\b/g) ?? []).length, 5, 'Preserve every narrative paragraph')
assert.match(story, /Registrado por: Thaveus, O Escriba/)
assert.doesNotMatch(html, /<aside\b|Ficha da facção|Nesta página/, 'A sparse faction must not leave empty reference blocks')
assert.match(html, /aria-current="page"/)
assert.match(html, /Todas as facções/)
assert.match(html, /href="#inicio"/)
console.log('PASS: faction story, attribution, sparse layout and navigation')
