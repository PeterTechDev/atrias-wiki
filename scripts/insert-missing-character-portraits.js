// Inserts character entities for portrait images that exist but have no DB entity.
// Run: node scripts/insert-missing-character-portraits.js

const { Client } = require('pg')

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** @type {Array<{name:string, image:string, description?:string, data?:Record<string, any>}>} */
const characters = [
  {
    name: 'Alan Kendra',
    image: '/images/characters/Alan Kendra-portrait2.jpg',
    description:
      'Aliado dos Ursos-Negros (Coldwind). Reúne-se com Eibjolf e Izur como homem de confiança do Martelo-de-Vento; invoca forças da natureza em combate.',
    data: { aliases: ['Allan Kendra'], faction: 'Ursos-Negros (Coldwind)' },
  },
  {
    name: 'Arannis',
    image: '/images/characters/Arannis Portrait.jpg',
    description:
      'Aventureiro do grupo das Fúrias de Videnserg. Protege Knut na travessia do rio e chega a se oferecer como campeão em um holmgang contra Folkvar; é ferido e perdido em meio ao caos do massacre de Videnserg.',
    data: { campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Ashyra',
    image: '/images/characters/Ashyra.jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: {},
  },
  {
    name: 'Captain Eobald',
    image: '/images/characters/Cap Eobald-portrait.jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: { title: 'Capitão' },
  },
  {
    name: 'Crono Elemental',
    image: '/images/characters/Crono Elemental.jpg',
    description: 'Entidade/ser elemental (informações ainda não catalogadas nos documentos extraídos).',
    data: { kind: 'elemental' },
  },
  {
    name: 'Dark Ionius',
    image: '/images/characters/Dark Ionius- Portrait.jpg',
    description:
      'Feiticeiro corrompido por um poder sombrio (ligado a Raga). Enfrenta Uthred em Videnserg e, após cair, seu sangue desencadeia um plano que incita a destruição da cidade.',
    data: { aliases: ['Ionius'], campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Eibjolf',
    image: '/images/characters/Eibjolf-Portrait.jpg',
    description:
      'Filho de Urdrolf Martelo-de-Vento, Jarl de Coldwind. Lidera guerreiros acompanhados por Ursos Negros e coopera com as Fúrias na guerra em Skeld.',
    data: { title: 'Líder dos Ursos-Negros', affiliation: 'Coldwind' },
  },
  {
    name: 'Fahrur',
    image: '/images/characters/Fahrur.jpg',
    description:
      'Ferreiro kandariano e amigo do grupo. Ajuda Strauss a tratar Uthred e explica o envenenamento por Marat Alruh ("espelho da alma"), associado à Ordem de Sasere.',
    data: { occupation: 'ferreiro', aliases: ['Fahru'] },
  },
  {
    name: 'Folkvar Bico-Sangrento',
    image: '/images/characters/folkvar-portrait.jpg',
    description:
      'Líder do Clã do Corvo e rei de Skeld. Ocupa Videnserg com suas forças, entra em conflito com Stibjorn e incita a guerra que culmina no massacre da cidade.',
    data: { faction: 'Clã do Corvo', title: 'Rei de Skeld' },
  },
  {
    name: 'Galahad',
    image: '/images/characters/Galahad Retrato.jpg',
    description:
      'Companheiro das Fúrias; caçador de sentidos aguçados. Torna-se hospedeiro do espírito Wendigo e assume forma bestial em combate.',
    data: { campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Gibson',
    image: '/images/characters/Gibson.jpg',
    description:
      'Halfling do grupo das Fúrias. Decifra cartas criptografadas, prepara tônicos e atua como combatente ágil, frequentemente atacando pelos flancos.',
    data: { ancestry: 'halfling', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Gordan',
    image: '/images/characters/Gordan-portrait.jpg',
    description:
      'Paladino que acompanhou o grupo no passado. Retorna como um Algoz ligado às forças sombrias (Sentinela Negro), com capacidade de invocar Dargheists.',
    data: { class: 'paladino', status: 'algoz' },
  },
  {
    name: 'Barão Van Klaus',
    image: '/images/characters/Grão Artificer Klaus.jpg',
    description:
      'Grão-Artífice dos Cruzados de Oas. Confronta as Fúrias em um forte de mineração e volta a enfrentá-los em Coldwind com um forjado bélico.',
    data: { title: 'Grão-Artífice', faction: 'Cruzados de Oas', aliases: ['Van Klaus', 'Klaus'] },
  },
  {
    name: 'Izur',
    image: '/images/characters/IzurNovo-portrait.jpg',
    description:
      'Aliado das Fúrias e homem de confiança do Martelo-de-Vento. Luta na linha de frente em Torngard e chega a se sacrificar para deter inimigos durante a batalha de Coldwind.',
    data: { aliases: ['Izur Miazaki'], faction: 'Ursos-Negros (Coldwind)' },
  },
  {
    name: 'Mistério',
    image: '/images/characters/Misterio-portrait.jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: {},
  },
  {
    name: 'Mokkog',
    image: '/images/characters/Mokkog .jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: {},
  },
  {
    name: 'Rasmusen',
    image: '/images/characters/Rasmusen Portrait.jpg',
    description:
      'Viajante e contador de histórias (conhecido como Rasmus). Revela informações sobre as Mid-Frosts e o Gjallarhorn, além da origem e significado dos Vestígios.',
    data: { aliases: ['Rasmus'] },
  },
  {
    name: 'Rhogar',
    image: '/images/characters/Rhogar.jpg',
    description:
      'Feiticeiro das Fúrias de Videnserg. Usa magia destrutiva e, mais tarde, carrega essência dracônica (incluindo Akatash) após rituais com Morveindren.',
    data: { class: 'feiticeiro', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Stibjorn',
    image: '/images/characters/Stibjorn-portrait.jpg',
    description:
      'Líder do orgulhoso Clã Presa de Javali em Skeld. Entra em conflito com Folkvar e o desafia a um holmgang após a carnificina em Videnserg.',
    data: { faction: 'Clã Presa de Javali', title: 'Líder' },
  },
  {
    name: 'Tal Rasha',
    image: '/images/characters/Tal Rasha.jpg',
    description:
      'Mago das Fúrias. Toca uma orbe poderosa, é ligado ao espírito Morgana e usa um cetro/artefato para teletransportar o grupo durante a batalha de Coldwind.',
    data: { class: 'mago', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Turmog',
    image: '/images/characters/Turmog.jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: {},
  },
  {
    name: 'Ulfgar',
    image: '/images/characters/Ulfgar-portrait2.jpg',
    description:
      'Anão devoto de Thor. Realiza rituais e milagres para salvar aliados (incluindo um ritual perigoso para curar Vasili) e lidera atos de fé durante a guerra em Skeld.',
    data: { ancestry: 'anão', deity: 'Thor', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Uthred',
    image: '/images/characters/Uthred- portrait2.jpg',
    description:
      'Guerreiro bárbaro das Fúrias. Sofre efeitos do veneno Marat Alruh e enfrenta o corrompido Ionius em Videnserg.',
    data: { class: 'bárbaro', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Vasili',
    image: '/images/characters/Vasili Retrato.jpg',
    description:
      'Bardo das Fúrias, usa magia de suporte e transformação (chega a transformar Gibson em mamute). Adoece gravemente e é salvo por um ritual arriscado conduzido por Ulfgar.',
    data: { class: 'bardo', campaign: 'Fúrias de Videnserg' },
  },
  {
    name: 'Vorlak',
    image: '/images/characters/Vorlak.jpg',
    description: 'Personagem de Átrias (informações ainda não catalogadas nos documentos extraídos).',
    data: {},
  },
  {
    name: 'Yurdra',
    image: '/images/characters/Yurdra-Portrait.jpg',
    description:
      'Ferreira (com forja improvisada) ligada aos Ursos-Negros. Pede ao grupo para recuperar diagramas do pai em Torngard e acaba envolvida em uma possessão/ligação demoníaca.',
    data: { occupation: 'ferreira', faction: 'Ursos-Negros (Coldwind)' },
  },
]

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  const inserted = []
  const skipped = []

  for (const c of characters) {
    const slug = slugify(c.name)
    const payload = {
      type: 'character',
      slug,
      name: c.name,
      description: c.description || null,
      image: c.image,
      status: 'published',
      data: c.data || {},
    }

    const res = await client.query(
      `insert into entities (type, slug, name, description, image, status, data)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (slug) do nothing
       returning id, slug`,
      [
        payload.type,
        payload.slug,
        payload.name,
        payload.description,
        payload.image,
        payload.status,
        payload.data,
      ]
    )

    if (res.rowCount === 1) inserted.push({ ...res.rows[0], name: c.name })
    else skipped.push({ slug, name: c.name })
  }

  console.log(JSON.stringify({ insertedCount: inserted.length, skippedCount: skipped.length, inserted, skipped }, null, 2))

  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
