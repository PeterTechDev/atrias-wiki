// Run with a Playwright Page or Codex browser tab on the local wiki:
// await checkGlobalSearch(page)
// Uses the existing Magia content; makes no database changes.
export async function checkGlobalSearch(tab) {
  const page = tab.playwright ?? tab
  const check = (value, message) => { if (!value) throw new Error(message) }
  check(await page.locator('header').count() === 1, 'Page must have one shared header')
  check(await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Wiki Átrias — início' }).count() === 1, 'Brand must be in the same navigation as search and account')
  const dialog = page.getByRole('dialog', { name: 'Buscar na wiki', exact: true })
  const trigger = page.getByRole('button', { name: /Buscar/ })
  const input = page.getByRole('searchbox', { name: 'Buscar na wiki', exact: true })
  await trigger.click()
  await input.fill('m')
  await page.getByText('Digite pelo menos 2 caracteres.', { exact: true }).waitFor({ state: 'visible' })
  await input.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  check(await trigger.evaluate(element => element === document.activeElement), 'Escape must restore trigger focus')
  await trigger.press('Control+k')
  await input.waitFor({ state: 'visible' })
  check(await input.evaluate(element => element === document.activeElement), 'Shortcut must focus search')
  await input.fill('zzzznenhumregistro987654321')
  await page.getByText(/Nenhum registro encontrado/).waitFor({ state: 'visible' })
  await input.fill('Magia')
  const first = dialog.getByRole('link').first()
  await first.waitFor({ state: 'visible' })
  await input.press('ArrowDown')
  check(await first.evaluate(element => element === document.activeElement), 'ArrowDown must focus first result')
  await first.press('ArrowUp')
  check(await input.evaluate(element => element === document.activeElement), 'ArrowUp must return to input')
  const destination = await first.getAttribute('href')
  await input.press('Enter')
  await dialog.waitFor({ state: 'hidden' })
  await page.waitForURL(`**${destination}`)
  await trigger.click()
  await page.getByRole('heading', { name: 'Pesquisas recentes' }).waitFor({ state: 'visible' })
  check(await dialog.getByRole('button', { name: 'Magia', exact: true }).count() === 2, 'Selected query must appear in recents as well as suggestions')
  await page.getByRole('button', { name: 'Fechar busca', exact: true }).click()
  return 'PASS: minimum query, empty state, shortcut, Escape/focus, arrows, result navigation and recents'
}
