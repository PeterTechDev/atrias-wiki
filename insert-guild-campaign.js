import pg from 'pg'
const { Client } = pg

const client = new Client('postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require')

async function main() {
  await client.connect()

  // 1. Create campaign
  const { rows: [campaign] } = await client.query(`
    INSERT INTO campaigns (slug, name, description, status)
    VALUES ($1, $2, $3, $4)
    RETURNING id, slug, name
  `, [
    'missoes-da-guilda',
    'Missões da Guilda',
    'Aventureiros recém-recrutados pela Guilda dos Improváveis de Solária. Suas missões começam pequenas, mas algo espreita além da Mortalha.',
    'active'
  ])
  console.log('Campaign created:', campaign)

  const narration = `Há grupos que nascem de propósito. Heróis escolhidos pelo destino, forjados em profecias, marcados desde o berço. Este não é um desses grupos.

Estes cinco foram convocados porque estavam disponíveis.

Sigard — o oficial-maior da Guilda, um homem que carrega o peso de manter a engrenagem funcionando enquanto os verdadeiros líderes lidam com problemas maiores — chamou-os à sala de reuniões. A mesma sala onde os Improváveis de Solária se sentam com o Barão Alric e os membros do Conselho. Paredes que já ouviram decisões que moldaram o Abrigo.

Para cinco aventureiros de nível três, era uma cadeira grande demais.

A missão, no papel, era simples: uma aventureira havia sido enviada para levar uma mensagem à Vigília de Akos, localizada quase no centro da Mortalha. Dos três que partiram, um voltou inconsciente — Ingram —, outro voltou abalado — Ralf —, e a terceira, a mensageira, simplesmente não voltou.

Sigard não sabia explicar por que uma aventureira fora enviada sozinha para dentro da Mortalha. Uma missão classificada como cinza. Algo não batia. O caminho de retorno que Ralf e Ingram escolheram era diferente — mais longo, talvez deliberadamente. Ninguém faz desvio na Mortalha por diversão.

Ruviel, o bardo, foi o primeiro a agir. Decidiu visitar Ingram no quarto da enfermaria, e Santiago o acompanhou. Encontraram o rapaz inconsciente — pupilas viradas, arritmia cardíaca forte, mas sem marcas visíveis no corpo. O que quer que tenha acontecido com ele não deixou cicatrizes na pele. Deixou em outro lugar.

Sem respostas ali, o grupo seguiu para o quartel. Roan já estava lá — uma caravana partiria em direção ao Forte da Aliança, próximo ao ponto que Ingram havia marcado no pergaminho. Conveniência ou coincidência, o grupo embarcou.

Roan notou que algumas caixas carregavam armas. Ruviel tentou arrancar informações dos guardas do comboio, mas eles não sabiam de nada — ou não queriam saber.

O Forte da Aliança recebeu o grupo com a hospitalidade típica de uma instalação militar: nenhuma. Sem autorização, sem entrada. Um soldado sugeriu que acampassem do lado de fora. O grupo decidiu ir mais adiante, para onde a floresta começa a mudar. Não era ainda a Mortalha de verdade, mas o ar já pesava diferente.

Montaram acampamento. Roan fez a ronda, disciplinado como se esperaria de um guerreiro. Ruviel e Santiago conversaram — o tipo de conversa que estranhos têm quando sabem que podem morrer juntos em breve. Aldren cuidou da fogueira com seu cão mecânico ao lado, uma criatura de engrenagens que não questionava ordens. Versper parou para olhar as estrelas.

E foi Versper quem percebeu primeiro. Algo errado no ambiente — uma dissonância, como uma nota fora do tom em uma melodia que só ele podia ouvir.

Roan viu em seguida. Ao lado de Versper, a figura do Eco da Mortalha se materializou. Não inteiramente — nunca inteiramente. Como se a própria escuridão tivesse decidido tomar forma emprestada.

Santiago reagiu primeiro. Atacou. O combate começou não por estratégia, mas por instinto.

O Eco usou sua habilidade de medo. Uma onda que varreu o acampamento como um vento gelado. Todos correram — exceto dois. Roan plantou os pés e assumiu postura defensiva, sem atacar. Não por covardia. Por algo mais calculado. E o Eco notou. A criatura pareceu... curiosa. Obcecada, talvez, por alguém que não fugiu e não atacou. Que simplesmente ficou.

Registro isso porque é raro. A maioria dos mortais reage à presença de um Eco com pânico ou violência. Roan ofereceu algo que a criatura claramente não esperava: compostura.

Os que fugiram voltaram. Todos, exceto Aldren. O artificer foi consumido por algo interno — lembranças, lampejos, visões do que sua tecnologia poderia causar. O medo do Eco desbloqueou algo que já estava lá, esperando.

No fim, o grupo prevaleceu. Mas o Eco não morreu — não da forma como coisas morrem. Após um golpe certeiro de Versper, ele simplesmente se desfez. Desvaneceu. Como fumaça que decide parar de existir.

Anoto este grupo com a mesma ressalva que anoto todos os novos: podem ser ninguém. Podem ser tudo. A diferença está no que acontece na segunda missão.

A Mortalha mostrou um cartão de visitas. Resta saber se eles vão querer ler o que está escrito no verso.`

  const rawRecap = `Recap da sessão 1 fornecido por Peter (Santiago). Grupo convocado por Sigard para investigar desaparecimento de aventureira enviada à Vigília de Akos. Ingram inconsciente, Ralf abalado. Viajaram com caravana ao Forte da Aliança, acamparam na borda da Mortalha. Encontro com Eco da Mortalha — Roan não fugiu nem atacou, Aldren consumido por visões. Eco desvaneceu após golpe de Versper.`

  const { rows: [session] } = await client.query(`
    INSERT INTO session_logs (
      campaign_id, chapter_number, title, raw_recap, narration,
      date_played, players_present, locations_visited, npcs_encountered,
      key_events, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, chapter_number, title
  `, [
    campaign.id,
    1,
    'Capítulo 1 — Cartão de Visitas',
    rawRecap,
    narration,
    '2026-02-04',
    JSON.stringify(['Rafael (Roan)', 'Marcos (Ruviel)', 'Peter (Santiago)', 'Ítalo (Versper)', 'Vinícius (Aldren)']),
    JSON.stringify(['Guilda dos Improváveis', 'Sala de Reuniões', 'Enfermaria', 'Quartel', 'Forte da Aliança', 'Borda da Mortalha']),
    JSON.stringify(['Sigard', 'Ingram', 'Ralf', 'Eco da Mortalha']),
    JSON.stringify([
      'Grupo convocado por Sigard para missão de busca',
      'Aventureira desaparecida na Mortalha — missão à Vigília de Akos',
      'Ingram encontrado inconsciente sem marcas visíveis',
      'Viagem com caravana ao Forte da Aliança',
      'Primeiro encontro com o Eco da Mortalha',
      'Roan não fugiu do medo — Eco ficou obcecado por ele',
      'Aldren consumido por visões internas durante o medo',
      'Eco desvaneceu após golpe de Versper'
    ]),
    'published'
  ])
  console.log('Session log created:', session)

  await client.end()
}

main().catch(console.error)
