import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import DiceRoller from '../src/app/dice/DiceRoller'

const html = renderToStaticMarkup(<DiceRoller />)
const dialog = html.match(/<dialog\b[^>]*id="dice-settings"[^>]*>([\s\S]*?)<\/dialog>/)
assert.ok(dialog, 'Customization lives in the settings dialog')
assert.ok(!dialog[0].split('>')[0].includes(' open'), 'Settings start closed')
assert.match(html, /aria-haspopup="dialog" aria-controls="dice-settings"/)
assert.match(dialog[1], /aria-pressed="true"[^>]*>[^<]*(?:<[^>]+>)* Som ligado/)
assert.match(dialog[1], /aria-pressed="true"[^>]*>[^<]*(?:<[^>]+>)*Movimento ligado/)
assert.ok(dialog[1].includes('Textura dos dados') && dialog[1].includes('Superfície da mesa'))
console.log('Dice settings: closed modal, customization controls and enabled defaults passed.')

assert.match(dialog[1], /id="roll-force"/, "Roll strength belongs in settings")
assert.equal((html.match(/id="roll-force"/g) ?? []).length, 1, "Strength has one control")
