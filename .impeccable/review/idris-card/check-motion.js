// Run with Playwright browser_run_code_unsafe's filename argument against the local dev server.
async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message) }
  const url = 'http://localhost:3000/characters/idris-rucandel'
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.goto(url)
  const section = page.getByRole('region', { name: 'Card 3D', exact: true })
  const card = section.getByRole('button')
  await section.scrollIntoViewIfNeeded()
  await section.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
  await page.mouse.move(0, 0)
  await page.waitForTimeout(700)
  const foreground = card.locator('img').nth(1)
  const resting = await foreground.evaluate(image => new DOMMatrix(getComputedStyle(image).transform).a)
  await card.hover()
  assert(await card.getAttribute('aria-pressed') === 'true', 'Mouse hover did not activate')
  const timing = await foreground.evaluate(image => {
    const animation = image.getAnimations().find(animation => animation.transitionProperty === 'transform')
    if (!animation) throw new Error('Missing transition')
    animation.pause()
    animation.currentTime = 200
    const style = getComputedStyle(image)
    const result = { duration: style.transitionDuration, easing: style.transitionTimingFunction, scale: new DOMMatrix(style.transform).a }
    animation.finish()
    return result
  })
  assert(timing.duration.includes('0.65s') && timing.easing.includes('ease'), 'Motion timing regressed')
  assert(timing.scale > resting && timing.scale < .98, 'Character jumps immediately to full size')
  await page.waitForTimeout(700)
  const expanded = await foreground.evaluate(image => new DOMMatrix(getComputedStyle(image).transform).a)
  assert(expanded / resting > 1.29 && expanded / resting < 1.31, 'Expected 30% growth')
  const bounds = await card.boundingBox()
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y - 140)
  assert(await card.getAttribute('aria-pressed') === 'true', 'Hover lost over the raised character')
  await section.screenshot({ path: '.impeccable/review/idris-card/animation-desktop.png' })
  await card.click()
  await page.mouse.move(0, 0)
  assert(await card.getAttribute('aria-pressed') === 'false', 'Mouse click pinned the card after leaving')
  await card.focus()
  await card.press('Space')
  assert(await card.getAttribute('aria-pressed') === 'true', 'Keyboard activation failed')

  const context = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  try {
    const mobile = await context.newPage()
    await mobile.goto(url)
    const mobileSection = mobile.getByRole('region', { name: 'Card 3D', exact: true })
    const mobileCard = mobileSection.getByRole('button')
    await mobileCard.tap()
    assert(await mobileCard.getAttribute('aria-pressed') === 'true', 'Touch activation failed')
    await mobile.waitForTimeout(700)
    assert(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile overflow')
    await mobileSection.screenshot({ path: '.impeccable/review/idris-card/animation-mobile.png' })
    await mobileCard.tap()
    assert(await mobileCard.getAttribute('aria-pressed') === 'false', 'Touch toggled twice')
    // A connected mouse must work even when the primary device is touch.
    await mobileCard.hover()
    assert(await mobileCard.getAttribute('aria-pressed') === 'true', 'Mouse ignored on a touch-primary device')
    await mobile.emulateMedia({ reducedMotion: 'reduce' })
    assert(await mobileCard.locator('img').first().evaluate(image => getComputedStyle(image).transitionDuration) === '0s', 'Reduced motion animates')
  } finally { await context.close() }
  return 'PASS: hover across raised figure, mouse exit, 30% growth, gradual 650ms easing, keyboard, touch, hybrid input and reduced motion'
}
