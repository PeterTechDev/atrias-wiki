import assert from 'node:assert/strict'

// Validation runs before database access. Never connect to a real database here.
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'

async function main() {
  const { createEntity, wikiEntityTypes } = await import('../src/db/queries/entities')
  const { favoritableEntityTypes } = await import('../src/db/queries/favorites')
  assert.ok(wikiEntityTypes.includes('deity'))
  assert.ok(favoritableEntityTypes.includes('deity'))
  for (const type of wikiEntityTypes) {
    const input = { type, name: 'Teste', slug: 'teste' }
    await assert.rejects(createEntity({ ...input, data: { media: [{ type: 'image', src: 'javascript:alert(1)' }] } }, { source: 'member' }), /Mídia 1/)
    for (const media of [[], [{ type: 'image', src: '/images/test.webp', alt: 'Imagem de teste' }]]) {
      // Valid media must get past content validation, stopping at the missing editor.
      await assert.rejects(createEntity({ ...input, data: { media } }, { source: 'member' }), /Invalid editor identity/)
    }
  }
  console.log('Category media: every category validates images and removal; deity is writable and favoritable.')
}

void main()
