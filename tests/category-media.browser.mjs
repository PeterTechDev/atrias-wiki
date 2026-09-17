// Run against an authenticated /wiki/deities/new. Publishes no records.
export async function checkCategoryMedia(page) {
  const assert = (value, message) => { if (!value) throw new Error(message) }
  await page.getByRole('button', { name: 'Adicionar mídia', exact: true }).click()
  await page.getByRole('textbox', { name: 'Endereço do arquivo', exact: true }).fill('/images/places/Zercrom.jpg')
  for (const type of ['character', 'place', 'faction', 'item', 'lore', 'monster', 'other', 'deity']) {
    await page.getByRole('combobox', { name: 'Categoria', exact: true }).selectOption(type)
    assert(await page.getByRole('region', { name: 'Imagens e vídeos', exact: true }).count() === 1, `Missing common gallery: ${type}`)
    assert(await page.getByRole('textbox', { name: 'Endereço do arquivo', exact: true }).getAttribute('value') === '/images/places/Zercrom.jpg', `Lost media: ${type}`)
    assert(await page.getByRole('button', { name: 'Enviar foto', exact: true }).count() === 1, `Missing upload: ${type}`)
  }
  await page.getByRole('button', { name: 'Remover mídia 1', exact: true }).click()
  assert(await page.getByRole('textbox', { name: 'Endereço do arquivo', exact: true }).count() === 0, 'Media was not removed')
  return 'PASS: common gallery, upload control, category switching and removal across eight categories.'
}
