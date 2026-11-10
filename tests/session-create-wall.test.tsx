import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { SessionCreateWall, sessionCreateView } from '../src/components/SessionCreateAccess'

assert.equal(sessionCreateView(true, null), 'loading')
assert.equal(sessionCreateView(false, null), 'wall')
assert.equal(sessionCreateView(false, undefined), 'wall')
assert.equal(sessionCreateView(true, { id: 'member' }), 'loading')
assert.equal(sessionCreateView(false, { id: 'member' }), 'form')

const wall = renderToStaticMarkup(<SessionCreateWall />)
assert.match(wall, /Entre para criar e editar páginas\./)
assert.match(wall, /href="\/login\?next=\/sessions\/new"/)
assert.match(wall, /Entrar \/ Criar conta/)
assert.doesNotMatch(wall, /Rápido|Texto Livre|Áudio|Manual|Despertar a Pena|Informações Básicas/)

const page = readFileSync('src/app/sessions/new/page.tsx', 'utf8')
assert.match(page, /sessionCreateView\(authLoading, user\) !== 'form'/)
assert.match(page, /<SessionCreateWall \/>/)
assert.match(page, /sessionSaveHeaders\(/)
const form = page.indexOf('Informações Básicas')
const gate = page.indexOf("sessionCreateView(authLoading, user) !== 'form'")
assert.ok(gate !== -1 && form !== -1 && gate < form, 'the login wall must return before the session form')

console.log('session create wall: anonymous visitors do not see the form')
