import { config } from 'dotenv'
import { Client } from 'pg'
import { getPlaceContent } from '../src/lib/placeContent'

config({ path: '.env.local', quiet: true })

// Source: NPC sheet and landscape supplied by Peter in this task. No generated lore.
const residents = [
  { name: 'Barão Aric Valtor', characterSlug: 'barao-aric-valtor', role: 'Líder da vila', description: 'Líder da vila de Solária, um homem de meia-idade que é respeitado e amado por seu povo. Ele é conhecido por sua sabedoria e justiça.' },
  { name: 'Lysandra', characterSlug: 'lysandra', role: 'Proprietária da Fios da Rainha', description: 'Proprietária da principal loja da vila, “Fios da Rainha”, que vende tecidos e roupas. Ela é uma meia-elfa charmosa e elegante, que é habilidosa em seu trabalho e bem relacionada com os nobres das cidades vizinhas.' },
  { name: 'Bertrand', characterSlug: 'bertrand', role: 'Fazendeiro-chefe', description: 'Fazendeiro-chefe da vila, responsável por supervisionar a produção de alimentos na região. Ele é um homem amigável e extrovertido, que é sempre visto com um sorriso no rosto.' },
  { name: 'Gwendolyn De Roccia', characterSlug: 'gwendolyn-de-roccia', role: 'Chefe da Companhia Roccia', description: 'Chefe da guilda dos mineiros “Companhia Roccia”, uma anã forte e corajosa que lidera as escavações nas montanhas próximas. Ela é conhecida por sua determinação e espírito empreendedor.' },
  { name: 'Marcellus Stone', characterSlug: 'marcellus-stone', role: 'Ferreiro da Fornalha Fulgurante', description: 'Ferreiro da vila, ele comanda sua oficina “Fornalha Fulgurante”, que é responsável pela produção de ferramentas para os habitantes locais. Ele é um homem reservado e taciturno, que raramente se abre com estranhos.' },
  { name: 'Abigail', characterSlug: 'abigail', role: 'Curandeira · Sândalo Dourado', description: 'A curandeira de Solária. Ela é uma mulher sábia e gentil, que conhece bem as ervas e remédios da região. Ela é conhecida por ajudar os doentes e feridos, e por ser uma conselheira confiável para aqueles que precisam. Ela possui um pequeno herbário, o Sândalo Dourado, e ocasionalmente supre alguns mercadores estrangeiros.' },
  { name: 'Thorne Ravenwood', characterSlug: 'thorne-ravenwood', role: 'Dono da taverna Leão Vermelho', description: 'O dono da Leão Vermelho, a taverna de Solária. Ele é um homem extrovertido e simpático, que adora contar histórias e ouvir as fofocas da vila. Ele é conhecido por sua habilidade em preparar cerveja e por organizar festas e celebrações na taverna.' },
  { name: 'Isadora', characterSlug: 'isadora', role: 'Bibliotecária', description: 'A bibliotecária de Solária. Ela é uma mulher inteligente e solitária, que adora ler e estudar. Ela é conhecida por sua vasta coleção de livros e por ser uma fonte confiável de conhecimento para aqueles que precisam.' },
].map(resident => ({ ...resident, image: `/images/characters/solaria/${resident.characterSlug}.png` }))

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 })
  await client.connect()
  try {
    await client.query('begin')
    const { rows: [place] } = await client.query('select * from entities where slug=$1 for update', ['abrigo-de-solaria'])
    if (!place || place.type !== 'place' || place.archived_at) throw new Error('Solária não foi encontrada como lugar ativo.')
    const existing = await client.query('select slug,name,type from entities where slug=any($1)', [residents.map(person => person.characterSlug)])
    if (existing.rows.some(entity => entity.type !== 'character')) throw new Error('Um dos endereços dos NPCs pertence a outra categoria.')
    console.log(JSON.stringify({ place: place.name, existingCharacters: existing.rows, create: residents.filter(person => !existing.rows.some(entity => entity.slug === person.characterSlug)).map(person => person.name), apply: process.argv.includes('--apply') }, null, 2))
    if (!process.argv.includes('--apply')) { await client.query('rollback'); return }
    for (const resident of residents) {
      await client.query(`insert into entities (type,slug,name,description,image,data,status,updated_by_source) values ('character',$1,$2,$3,$4,$5,'published','admin') on conflict (slug) do nothing`, [resident.characterSlug, resident.name, resident.description, resident.image, JSON.stringify({ affiliation: 'Abrigo de Solária', media: [{ type: 'image', src: resident.image, alt: `Retrato de ${resident.name}` }] })])
    }
    const sourceText = (place.description ?? '').replace(/pos-suía/g, 'possuía').replace(/home-nagem/g, 'homenagem').replace(/asses-sorado/g, 'assessorado').replace(/repre-sentam/g, 'representam').replace(/fa-zendeiros/g, 'fazendeiros').replace(/fres-cos/g, 'frescos').replace(/teci-dos/g, 'tecidos').replace(/prin-cipais/g, 'principais').replace(/protegen-do-a/g, 'protegendo-a').replace(/dedica-dos/g, 'dedicados').replace(/mo-mento/g, 'momento').replace(/manu-seio/g, 'manuseio').replace(/re-cebem/g, 'recebem')
    const content = getPlaceContent(place.data ?? {}, sourceText)
    if (!Array.isArray(place.data?.sections)) {
      const paragraphs = content.intro.split('\n').filter(Boolean)
      if (paragraphs.length > 1) { content.intro = paragraphs[0]; content.sections.unshift({ title: 'História', content: paragraphs.slice(1).join('\n') }) }
    }
    const existingResidents = place.data?.residents ?? []
    const data = {
      ...place.data,
      type: place.data?.type || 'Vila', region: place.data?.region || 'Colinas do Serpeio', population: place.data?.population || 'Cerca de 600 habitantes', government: place.data?.government || 'Barão Aric Valtor e conselho de anciãos',
      sections: content.sections,
      media: place.data?.media ?? [{ type: 'image', src: '/images/places/abrigo-de-solaria.png', alt: 'Vila de construções de madeira sobre encostas rochosas, cercada por montanhas.', caption: 'Abrigo de Solária' }],
      maps: place.data?.maps ?? [{ type: 'image', src: '/images/maps/solaria.jpg', alt: 'Planta ilustrada da vila de Solária, com ruas, construções, campos e muralhas.', caption: 'Mapa da vila de Solária' }],
      residents: [...existingResidents, ...residents.filter(resident => !existingResidents.some((existing: { characterSlug?: string; name: string }) => existing.characterSlug === resident.characterSlug || existing.name === resident.name))],
    }
    if (JSON.stringify(data) !== JSON.stringify(place.data) || content.intro !== place.description) await client.query('update entities set description=$1,data=$2,revision=revision+1,updated_at=now(),updated_by_source=$3 where id=$4', [content.intro, JSON.stringify(data), 'admin', place.id])
    await client.query('commit')
    console.log('Solária e os oito NPCs foram vinculados. Personagens existentes foram preservados.')
  } catch (error) { await client.query('rollback'); throw error }
  finally { await client.end() }
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
