// Run on a successful creation (or an isolated preview); performs no writes.
export async function checkWikiCreationSuccess(page, { destination, collection, isSpoiler }) {
  const assert = (value, message) => { if (!value) throw new Error(message) }
  const result = await page.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="creation-success"]')
    return {
      text: section?.textContent,
      focused: document.activeElement?.id,
      links: [...(section?.querySelectorAll('a') ?? [])].map(a => a.getAttribute('href')),
      overflows: document.documentElement.scrollWidth > innerWidth,
    }
  })
  assert(result.focused === 'creation-success', 'Completion must receive keyboard focus')
  assert(result.text.includes(isSpoiler ? 'Somente mestres podem acessar.' : 'A página está visível para todos.'), 'Incorrect visibility message')
  assert(result.links.join('|') === [destination, `/wiki${destination}/edit`, `/wiki/${collection}/new`].join('|'), 'Incorrect next-action destinations')
  assert(!result.overflows, 'Completion overflows the viewport')
  return 'PASS: completion focus, visibility, links, and responsive layout'
}
