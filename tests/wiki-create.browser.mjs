// Run checkWikiCreate(tab.playwright) in CUA on an authenticated /wiki/others/new.
// Uses only invalid submissions: no record is published.
export async function checkWikiCreate(page) {
  const assert = (value, message) => { if (!value) throw new Error(message) }
  const name = page.getByRole('textbox', { name: 'Nome (obrigatório)', exact: true })
  const category = page.getByRole('combobox', { name: 'Categoria', exact: true })
  const address = page.getByRole('textbox', { name: 'Endereço da página', exact: true })
  const details = page.getByText('Adicionar detalhes', { exact: false })
  await category.selectOption('character')
  await name.fill('Guardião de Átrias')
  assert(await page.getByRole('heading', { name: 'Criar página', exact: true }).count() === 1, 'Category changed the neutral title')
  assert(!await page.getByRole('textbox', { name: 'Raça', exact: true }).isVisible(), 'Optional fields should start collapsed')
  await page.locator('summary').filter({ hasText: 'Endereço da página' }).click()
  assert(await address.evaluate(el => el.value) === 'guardiao-de-atrias', 'Name did not generate the address')
  await address.fill('guardiao-personalizado')
  await name.fill('Outro nome')
  assert(await address.evaluate(el => el.value) === 'guardiao-personalizado', 'Name overwrote a custom address')
  await details.click()
  await page.getByRole('textbox', { name: 'Raça', exact: true }).fill('Elfo')
  await category.selectOption('item')
  await category.selectOption('character')
  assert(await page.getByRole('textbox', { name: 'Raça', exact: true }).evaluate(el => el.value) === 'Elfo', 'Switching category lost the character fields')
  // Required fields inside a closed disclosure must become visible before focus.
  await page.getByRole('button', { name: 'Adicionar card 3D', exact: true }).click()
  await details.click()
  assert(await page.locator('input:invalid').count() > 0, 'Refusing to submit a valid form during this test')
  await page.getByRole('button', { name: 'Criar página', exact: true }).press('Enter')
  assert(await page.getByRole('button', { name: 'Remover card 3D', exact: true }).isVisible(), 'Invalid card remained hidden')
  assert(await page.evaluate(() => document.activeElement?.matches('input:invalid')), 'Invalid field did not receive focus')
  await page.getByRole('button', { name: 'Remover card 3D', exact: true }).click()
  await address.press('ControlOrMeta+A')
  await address.press('Backspace')
  assert(await address.evaluate(el => el.value === '' && !el.validity.valid), 'Address must be empty before the invalid submission')
  await page.locator('summary').filter({ hasText: 'Endereço da página' }).click()
  await page.getByRole('button', { name: 'Criar página', exact: true }).press('Enter')
  assert(await address.isVisible(), 'Invalid address remained hidden')
  assert(await address.evaluate(el => el === document.activeElement), 'Invalid address did not receive focus')
  const spoiler = page.getByRole('checkbox', { name: /Restringir a mestres/ })
  if (await spoiler.count()) {
    await spoiler.check()
    assert(await page.getByText('Somente mestres podem acessar esta página.', { exact: true }).isVisible(), 'Restricted visibility not explained')
    await spoiler.uncheck()
    assert(await page.getByText('Visível para todos, incluindo visitantes sem conta.', { exact: true }).isVisible(), 'Public visibility not explained')
  }
  return 'PASS: compact creation, category change, custom address, preserved details, hidden-field validation/focus and visibility. No record published.'
}
