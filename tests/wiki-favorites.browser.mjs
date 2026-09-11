// Run checkFavorites(tab.playwright) in CUA, or pass a Playwright Page.
// Open /wiki/favorites with at least one saved page; no data is changed.
export async function checkFavorites(page) {
  return page.evaluate(() => {
    const assert = (value, message) => { if (!value) throw new Error(message) }
    assert(document.querySelector('h1')?.textContent === 'Favoritos', 'Missing page title')
    assert(document.documentElement.scrollWidth <= window.innerWidth, 'Horizontal overflow')
    const rows = [...document.querySelectorAll('main li')]
    assert(rows.length > 0, 'Save a page before running the populated-list check')
    for (const row of rows) {
      const title = row.querySelector('h2')
      const link = row.querySelector('a')
      const button = row.querySelector('button')
      const preview = row.querySelector('.line-clamp-2')
      assert(link?.textContent === title?.textContent, 'Link name includes more than the title')
      assert(button?.getBoundingClientRect().height >= 44, 'Removal target is too small')
      assert(button?.getAttribute('aria-label')?.includes(title.textContent), 'Removal label lacks entity name')
      if (preview) assert(preview.getBoundingClientRect().height <= getComputedStyle(preview).lineHeight.replace('px', '') * 2 + 1, 'Preview exceeds two lines')
    }
    return `PASS: ${rows.length} favorites; short links, two-line previews, named 44px controls, no overflow`
  })
}
