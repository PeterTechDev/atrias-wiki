import { config } from 'dotenv'
import { Client } from 'pg'
import { validateCharacterCard } from '../src/lib/characterCard'

config({ path: '.env.local', quiet: true })

const card = {
  foreground: '/images/characters/idris-3d-foreground.webp',
  background: '/images/characters/idris-3d-background.webp',
  alt: 'Idris Rucandel com armadura escura, manto branco, escudo com leão vermelho e espada luminosa.',
}

async function main() {
  validateCharacterCard(card)
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 })
  await client.connect()
  try {
    await client.query('begin')
    const { rows: [idris] } = await client.query('select id, name, data from entities where type=$1 and slug=$2 and archived_at is null for update', ['character', 'idris-rucandel'])
    if (!idris) throw new Error('Idris Rucandel não foi encontrado.')
    if (idris.data?.card3d) {
      if (JSON.stringify(idris.data.card3d) !== JSON.stringify(card) && (idris.data.card3d.foreground !== card.foreground || idris.data.card3d.background !== card.background)) throw new Error('Idris já tem outro card 3D. Preserve a edição existente.')
      console.log('Idris já possui o card. Nenhuma alteração.'); await client.query('rollback'); return
    }
    console.log(JSON.stringify({ character: idris.name, card3d: card, apply: process.argv.includes('--apply') }, null, 2))
    if (!process.argv.includes('--apply')) { await client.query('rollback'); return }
    await client.query('update entities set data=$1, revision=revision+1, updated_at=now(), updated_by_source=$2 where id=$3', [{ ...idris.data, card3d: card }, 'admin', idris.id])
    const { rows: [saved] } = await client.query('select data from entities where id=$1', [idris.id])
    validateCharacterCard(saved.data.card3d)
    if (JSON.stringify(saved.data.media) !== JSON.stringify(idris.data?.media)) throw new Error('A galeria foi alterada inesperadamente.')
    await client.query('commit')
    console.log('Card de Idris salvo; galeria preservada.')
  } catch (error) { await client.query('rollback'); throw error }
  finally { await client.end() }
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
