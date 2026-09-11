// Run against a running app: npx tsx tests/homepage.test.ts [http://localhost:3000]
import assert from 'node:assert/strict'

async function main() {
  const base = process.argv[2] ?? 'http://localhost:3000'
  const response = await fetch(base)
  assert.equal(response.status, 200, 'Homepage must load')
  const html = await response.text()
  const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main, 'Homepage must render its content')
  const hero = main.match(/<section\b[^>]*aria-labelledby="home-title"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero?.includes('href="/dice"'), 'The dice table must be accessible directly from the hero')
  assert.doesNotMatch(main, /href="\/studio"|\\u2694|images\.unsplash\.com/, 'Broken legacy links, icons and placeholder images must not return')
  const features = [...main.matchAll(/<a\b[^>]*aria-label="Conhecer [^"]+"[^>]*>[\s\S]*?<\/a>/g)]
  assert.equal(features.length, [...main.matchAll(/<h3\b/g)].length, 'Every featured entry must be a complete, named link')
  const destinations = features.map(([link]) => link.match(/href="([^"]+)"/)?.[1])
  if (main.includes('href="/wiki/others/new"')) destinations.push('/wiki/others/new')
  for (const path of new Set(destinations)) {
    assert.ok(path, 'Featured entry needs a destination')
    const result = await fetch(new URL(path, base))
    assert.equal(result.status, 200, `${path} must open (or redirect to sign-in) successfully`)
  }
  console.log(`Homepage passed: ${features.length} featured links and contribution destination checked.`)
}

main().catch(error => { console.error(error); process.exitCode = 1 })
