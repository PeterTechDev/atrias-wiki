// Run checkCharacterCard(tab.playwright) with the character page open in CUA.
// Also accepts a Playwright Page. No data is changed.
export async function checkCharacterCard(page) {
  const assert = (value, message) => { if (!value) throw new Error(message) }
  const trigger = page.getByRole('button', { name: 'Ver card 3D', exact: true })
  assert(await trigger.count() === 1, 'Expected one optional card entry point')
  assert(await page.locator('dialog img').count() === 0, 'Closed viewers should not load images')
  await trigger.click()
  assert(await page.locator('dialog[open]').count() === 1, 'Card did not open')
  assert(await page.locator('dialog[open] img').count() === 2, 'Card layers missing')
  await page.getByRole('button', { name: 'Fechar card 3D', exact: true }).press('Escape')
  await page.locator('dialog img').first().waitFor({ state: 'detached' })
  assert(await page.locator('dialog[open]').count() === 0, 'Escape did not close the card')
  assert(await page.evaluate(() => document.activeElement?.textContent === 'Ver card 3D'), 'Focus was not restored')
  await trigger.click()
  await page.getByRole('button', { name: 'Fechar card 3D', exact: true }).click()
  await page.locator('dialog img').first().waitFor({ state: 'detached' })
  assert(await page.locator('dialog[open]').count() === 0, 'Close button failed')
  assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Page remains scroll locked')
  assert(await page.locator('dialog img').count() === 0, 'Card layers remain mounted after closing')
  return 'PASS: optional card, deferred images, open, Escape, focus return, reopen, close and scroll restoration'
}
