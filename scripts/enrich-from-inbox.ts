import { Client } from 'pg'

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_SARX6nKCJM3W@ep-delicate-bonus-ail09mvp-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

type Patch = {
  description: string
  data?: Record<string, unknown>
  sourceFile?: string
}

const patches: Record<string, Patch> = {
  // --- A Chama Branca ---
  'chama-branca': {
    description:
      'A Chama Branca é uma fé dedicada à justiça e à ordem: uma luz pura que expõe a corrupção e guia o julgamento. Ao contrário de deuses antropomórficos, raramente é descrita com forma física — um símbolo de que a justiça deve alcançar todos os povos. Seus fiéis a invocam como defensora dos oprimidos e árbitra de conflitos, buscando sempre que a verdade prevaleça.\n\nO clero é conhecido como Luminares, organizado em graus (Vigilante, Luminar da Sentença e Luminar Elevado). Seus templos variam de grandes santuários a instalações civis vinculadas ao ideal de ordem (quartéis, prisões e salões de comuna), funcionando também como centros comunitários e de restauração da lei. Em rituais, a presença da Chama costuma ser evocada por lanternas e velas brancas, lembrando a busca por clareza espiritual, esperança e transformação.',
    data: {
      kind: 'fé/divindade',
      alinhamento: ['Leal Bom', 'Leal Neutro'],
      armaSagrada: 'Espada longa',
      dominios: ['Justiça', 'Ordem', 'Luz'],
      portfolio: ['Justiça', 'Redenção', 'Tribunal', 'Acerto de contas'],
      devotos: ['Cavaleiros', 'Paladinos', 'Juízes', 'Soldados', 'Condestáveis'],
      sinais: ['balança', 'espada longa cruzada', 'vela/lanterna branca'],
      hierarquia: ['Vigilante', 'Luminar da Sentença', 'Luminar Elevado'],
      manifestacoes: [
        'Luz radiante e pura; por vezes uma chama dócil e brilhante',
        'Evocada em rituais por velas e lanternas brancas',
      ],
    },
    sourceFile: 'content-inbox/A Chama Branca.docx',
  },
  'luminares': {
    description:
      'Luminares é o nome dado ao clero da Chama Branca. Seus membros atuam como guardiões da lei, da ordem e da luz, conduzindo ritos, julgamentos e atos de restauração quando a corrupção se espalha. A tradição descreve uma progressão de graus: Vigilante, Luminar da Sentença e Luminar Elevado.\n\nEm muitas comunidades, os Luminares não se distinguem por uma vestimenta única — preferem sinais discretos ligados à vigilância e à justiça (como balanças, velas e a espada longa cruzada), refletindo a ideia de que a justiça deve existir em qualquer cultura.',
    data: {
      kind: 'clero',
      vinculo: 'Chama Branca',
      graus: ['Vigilante', 'Luminar da Sentença', 'Luminar Elevado'],
    },
    sourceFile: 'content-inbox/A Chama Branca.docx',
  },
  'dogma-da-chama-branca': {
    description:
      '"Revele a verdade, puna os culpados, corrija o erro e seja sempre verdadeiro e justo em suas ações. A ordem é o caminho que trilhamos em comunhão para promover o bem-estar de todos."',
    data: { kind: 'dogma', vinculo: 'Chama Branca' },
    sourceFile: 'content-inbox/A Chama Branca.docx',
  },
  'proverbios-da-chama-branca': {
    description:
      'Provérbios tradicionais associados à Chama Branca:\n\n• "A verdade ilumina o caminho, mas a justiça é a luz que guia nossos passos."\n• "Onde há ordem, a paz prospera; onde há paz, a justiça se estabelece."\n• "O bem comum é uma chama que se alimenta do serviço e da solidariedade."\n• "Em cada ato de justiça, a luz da Chama Branca brilha mais intensamente."\n• "A sabedoria é o farol que orienta a jornada daqueles que buscam a iluminação."\n• "A redenção é a chama que renova o espírito, permitindo que cada passo dado seja um avanço em direção à luz."',
    data: { kind: 'provérbios', vinculo: 'Chama Branca' },
    sourceFile: 'content-inbox/A Chama Branca.docx',
  },
  'templos-da-chama-branca': {
    description:
      'Os templos da Chama Branca são concebidos para refletir luz, justiça e ordem. Além de locais de adoração, atuam como centros de comunidade e de restauração do direito — faróis de esperança em tempos de abuso ou corrupção.\n\nSua forma varia conforme a região: de grandes templos dedicados à causa a estruturas ligadas à vida civil, como quartéis, prisões e salões de comuna. Em geral, velas e lanternas brancas são usadas como símbolos constantes da vigilância e do compromisso com a verdade.',
    data: { kind: 'templo', vinculo: 'Chama Branca' },
    sourceFile: 'content-inbox/A Chama Branca.docx',
  },

  // --- Magia em Átrias ---
  'alta-arcanas': {
    description:
      "As Alta'Arcanas são pináculos (torres) criados para preservar, ensinar e vigiar o conhecimento mágico após a Ruptura. Fundadas pelo mago humano Khay'zam, elas funcionam como centros de estudo restrito: a magia deve ser disseminada com segurança e sob um código rígido, para evitar que seus praticantes sucumbam à Marca da Ambição — uma maldição ligada ao legado de poder e cataclismo do passado.\n\nDiz-se que três torres foram erguidas, uma em cada um dos novos continentes: em Kandar (o continente árido), em Eledhel (a nação féerica) e ao norte, na grande ilha de Skeld. Rumores persistem sobre uma quarta torre no suposto epicentro da Ruptura, jamais confirmada.\n\nEntre seus instrumentos de controle estão os Caçadores de Sangue: uma força marcial treinada desde cedo e submetida a um ritual que altera a própria biologia, destinada a caçar e julgar usuários de magia fora de controle — podendo até nulificá-los, arrancando-lhes o domínio arcano.",
    data: {
      kind: 'ordem arcana',
      fundador: "Khay'zam",
      proposito: ['preservar conhecimento', 'ensinar com restrição', 'vigiar e conter abusos'],
      torresConhecidas: ['Kandar', 'Eledhel', 'Skeld'],
      rumores: ['quarta torre no epicentro da Ruptura (não confirmada)'],
      codigo: ['evitar a Marca da Ambição', 'julgar e conter usuários fora de controle'],
    },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'khay-zam': {
    description:
      "Khay'zam é um mago humano lendário associado ao período imediatamente posterior à Ruptura. Em meio ao avanço infernal e às divindades caídas e enfraquecidas, ele reuniu os poucos avatares divinos restantes e liderou forças celestiais contra as hordas do Lorde Supremo Drawghar Mototh. A vitória — obtida a alto custo — culminou no selamento de Mototh e na expulsão de sua horda.\n\nApós o conflito, as divindades sobreviventes teriam imbuído Khay'zam com parte de seu poder e conhecimento para que protegesse e vigiasse o mundo. Com esse legado, ele fundou as Alta'Arcanas, torres destinadas a concentrar o saber arcano e impedir que a magia voltasse a desencadear um cataclismo como o da Ruptura.",
    data: {
      kind: 'mago humano',
      associacoes: ["Alta'Arcanas", 'Ruptura'],
      feitos: ['liderou resistência celestial', 'selou Drawghar Mototh', 'fundou as Alta\'Arcanas'],
    },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'drawghar-mototh': {
    description:
      'Drawghar Mototh é descrito como um Lorde Infernal Supremo cuja horda foi libertada em sua forma plena durante os eventos que cercam a Ruptura. Derrotado a um grande custo pela coalizão liderada por Khay\'zam, Mototh teria sido selado e suas forças banidas para o esquecimento, tornando-se um símbolo do risco existencial que a magia e a ambição desmedida podem desencadear.',
    data: { kind: 'lorde infernal', status: 'selado (segundo tradição)' },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'cacadores-de-sangue': {
    description:
      'Os Caçadores de Sangue são uma força marcial ligada às Alta\'Arcanas. Humanos treinados desde cedo nos conhecimentos ocultos, são submetidos a um ritual que altera sua biologia para torná-los caçadores perfeitos. Sua função é perseguir usuários de magia que saem de controle e levá-los a julgamento, inclusive com a possibilidade de nulificação — a perda do controle e do acesso às forças arcanas.',
    data: { kind: 'ordem marcial', vinculo: "Alta'Arcanas", funcao: ['caçar', 'conter', 'julgar', 'nulificar'] },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'a-ruptura': {
    description:
      'A Ruptura é o cataclismo que marcou a história mágica de Átrias: um período de conflito entre potências cósmicas desencadeado quando mortais e arcanistas se tornaram poderosos o bastante para desafiar o divino. A tradição relata que barganhas antigas com Lordes Infernais iniciaram a disseminação do conhecimento arcano; com o tempo, a ambição levou a tentativas de usurpar a divindade, provocando a queda de múltiplas entidades divinas.\n\nO choque entre forças celestiais e infernais culminou no confronto liderado por Khay\'zam contra o Lorde Supremo Drawghar Mototh. O cataclismo resultante teria literalmente dividido continentes, devastado cidades e nações e, por um período, permitido que infernais absorvessem a essência de divindades caídas. Após a vitória e o selamento de Mototh, nasce a política de contenção da magia: as Alta\'Arcanas são fundadas para preservar o saber e impedir um novo desastre.',
    data: {
      kind: 'evento histórico/místico',
      consequencias: ['cataclismos', 'devastação de cidades e nações', 'divisão de continentes', "fundação das Alta'Arcanas"],
      figuras: ["Khay'zam", 'Drawghar Mototh'],
    },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'ruptura': {
    description:
      'Ruptura é o nome dado ao grande cataclismo ligado ao auge do conflito entre magia e divindades em Átrias. Relatos atribuem sua origem à ambição arcana: após séculos de disseminação do conhecimento mágico, mortais desafiaram o divino e desencadearam a queda de entidades, a ascensão de forças infernais e desastres que devastaram regiões inteiras. O período termina com a derrota e o selamento do Lorde Infernal Drawghar Mototh por forças lideradas por Khay\'zam e com a criação das Alta\'Arcanas como resposta institucional para vigiar e limitar o uso do arcano.',
    data: { kind: 'evento histórico/místico', relacionadoA: ['A Ruptura', "Alta'Arcanas"] },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },

  // --- Ordem de Ghalbaht / origem ---
  'ordem-de-ghalbaht': {
    description:
      'A Ordem de Ghalbaht é uma organização druídica espalhada pelos quatro cantos de Átrias, dedicada a manter o equilíbrio e a ordem natural do mundo. Seus membros se veem como balanças: cada escolha tem dois lados e cada criatura ocupa um papel no ciclo. Baseando-se nos quatro elementos (Terra, Fogo, Água e Ar), os ordenados buscam garantir que o ciclo da natureza tenha início, meio e fim — e que interferências corrompidas sejam contidas.\n\nUma marca distintiva da Ordem é o uso do escudo, símbolo de defesa do círculo e de proteção do equilíbrio. Seus membros costumam evitar armas ofensivas, seguindo o exemplo atribuído a Ghalbaht: a proteção é o que importa. O treinamento passa por provações; após elas, o druida torna-se um Baluarte do Elemento e pode elementalizar e decorar seu escudo. Nos níveis mais altos, a Ordem descreve a diferença entre manipular e dominar um elemento: domínio pleno concede vantagens únicas.\n\nA Ordem também reconhece ameaças internas e externas: a Corja Traidora (ex-membros que se corromperam), os Seguidores de Mordred (druidas criados em magia negra) e, em termos amplos, os Portadores de Armas — quaisquer criaturas que interfiram no equilíbrio ou usem magia negra.',
    data: {
      kind: 'ordem druídica',
      pilares: ['equilíbrio', 'ciclo natural', 'quatro elementos'],
      simbolo: 'escudo',
      elementos: ['Terra', 'Fogo', 'Água', 'Ar'],
      hierarquia: [
        'Regente do Equilíbrio',
        'Alto Conselho da Natureza',
        'Guardião da Ordem',
        'Adjutores Naturais',
        'Baluartes do Elemento',
        'Principiantes do Resguardo',
        'Recém-chegados da Tutela',
      ],
      antagonistas: ['Corja Traidora', 'Seguidores de Mordred', 'Portadores de Armas'],
    },
    sourceFile: 'content-inbox/A ordem de Ghalbath.rtf',
  },
  'amergin-ghalbath': {
    description:
      'Amergin Ghalbath é a figura central do mito de origem associado a Ghalbaht. Sua vida anterior é descrita como comum e incerta — pescador, pastor, padeiro — mas seu passado teria sido apagado (ou “transmutado”). No período pré-Ruptura, ao socorrer um homem mortalmente ferido, Amergin afirma sentir o lamento do mundo: a terra, o vento, a água e o sol pareciam sofrer com aquela morte.\n\nO moribundo revela-se Silvanus, então deus da natureza e dos elementos. Para proteger Amergin do que viria, Silvanus arrebata sua alma e a envia aos Planos Interiores, para que ouvisse a voz do mundo. Imbuído da essência vital do deus, Amergin vaga por décadas entre os quatro Planos Elementais: sua alma atravessa o Ar, é forjada no Fogo, moldada na Terra e renascida na Água. Entre djinns, elementais e para-elementais, ele aprende e compreende a necessidade de cicatrizar as feridas do mundo para que o ciclo continue.\n\nSeu retorno a Átrias é narrado como um prodígio: cinzas ao vento se aglomeram e tomam a forma de um homem, enquanto madeira queimada revive e brotos surgem — sinal de que Ghalbath volta não mais como um homem comum.',
    data: { kind: 'figura mítica', associadoA: ['Ghalbath', 'Silvanus', 'Planos Elementais'] },
    sourceFile: 'content-inbox/A Origem de Ghalbath.rtf',
  },
  'ghalbath': {
    description:
      'Ghalbath é lembrado como um druida lendário ligado à fundação e aos ideais da Ordem de Ghalbaht. A tradição reforça seu repúdio ao uso de armas ofensivas e a centralidade do escudo como símbolo de defesa do círculo e da ordem natural. Também é associado ao mito de Amergin Ghalbath, no qual uma alma é moldada pelos quatro Planos Elementais para ouvir a voz do mundo e retornar como agente de equilíbrio.',
    data: { kind: 'druida lendário', vinculo: 'Ordem de Ghalbaht', simbolo: 'escudo' },
    sourceFile: 'content-inbox/A ordem de Ghalbath.rtf',
  },

  // --- História de Norbria ---
  'norbria': {
    description:
      'Norbria (“Sangue Nórdico”) nasceu de uma história de invasões e pactos no norte do continente Oeste. O local era, originalmente, uma vila pesqueira às margens do Lago Teamor. Sua geografia — acesso direto ao Mar do Norte, protegido por cadeias de montanhas em ambos os lados — tornou a região um ponto de desembarque ideal para incursões skeldianas.\n\nEnquanto líderes costeiros tentavam conter saques, clãs skeldens se estabeleciam ao norte da Terra dos Vales e expandiam território. Andrastos, então governante de Vallen, avançou para retomar domínios e encontrou nos Rochedos de Baldren uma cidade rudimentar e um porto já funcionando. Em vez de expulsar os invasores, propôs um acordo: cederia terras e títulos, e o clã protegeria o norte de Humma contra futuras invasões sazonais.\n\nA notícia do trato provocou reação em Skeld: clãs se uniram e formaram a primeira Horda, que devastou a região do Lago Teamor e massacrou os descendentes dos primeiros colonos. Para enfrentar a ameaça, as coroas de Humma, Noan e Falandir formaram o Pacto de Ociddens. A guerra durou dias; o Pacto venceu, mas Andrastos morreu em batalha.\n\nQuínewen, filha de Andrastos, assumiu a coroa de Vallen e manteve o acordo: skeldens permaneceriam ao norte sob o estandarte de Humma. Para impedir novos ataques, Vallen financiou um forte numa ilha ao norte, na baía de Hardenfor. Com os anos, a segurança trouxe prosperidade, e a cidade passou a ser conhecida como Norbria em homenagem aos mortos do primeiro ataque da Horda. Andrastos recebeu o título de “O Unificador”; todo ano, no dia de sua morte, celebra-se um festival em Norbria e em Vallen.',
    data: {
      kind: 'cidade portuária',
      regiao: 'norte do continente Oeste',
      origem: 'vila pesqueira no Lago Teamor',
      eventos: ['primeira Horda skelden', 'formação do Pacto de Ociddens', 'morte de Andrastos'],
      figuras: ['Andrastos', 'Quínewen'],
      defesa: ['forte de Hardenfor (na baía de Hardenfor)'],
      etimologia: 'Sangue Nórdico',
    },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'lago-teamor': {
    description:
      'O Lago Teamor é um grande lago no norte do continente Oeste, às margens do qual surgiu a antiga vila pesqueira que daria origem a Norbria. Por sua posição estratégica — conectando-se ao Mar do Norte por uma passagem protegida por montanhas — tornou-se palco do desembarque de invasões skeldianas e do massacre associado à primeira Horda.',
    data: { kind: 'lago', relacionadoA: ['Norbria', 'primeira Horda skelden'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'baia-de-hardenfor': {
    description:
      'A baía de Hardenfor é uma enseada ao norte da região de Norbria. Após a vitória do Pacto de Ociddens sobre a primeira Horda, Vallen financiou a construção de um forte em uma ilha na baía, para repelir futuras incursões skeldianas e proteger o continente Oeste.',
    data: { kind: 'baía', relacionadoA: ['Norbria', 'Vallen', 'Pacto de Ociddens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'vallen': {
    description:
      'Vallen é uma coroa/território do continente Oeste ligada à defesa do norte contra incursões skeldianas. Foi governada por Andrastos no período das primeiras invasões, e depois por sua filha Quínewen. Vallen financiou a fortificação de Hardenfor e mantém, anualmente, um festival em homenagem a Andrastos, "O Unificador".',
    data: { kind: 'reino/coroa', relacionadoA: ['Andrastos', 'Quínewen', 'Norbria'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'pacto-de-ociddens': {
    description:
      'O Pacto de Ociddens é uma aliança formada para proteger o continente Oeste da ameaça skelden durante a crise da primeira Horda. É composto pelas coroas de Humma, Noan e Falandir. O Pacto venceu a campanha que conteve a Horda ao custo da vida de Andrastos, governante de Vallen.',
    data: { kind: 'aliança', membros: ['Humma', 'Noan', 'Falandir'], conflito: 'primeira Horda skelden' },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'guarda-argentea': {
    description:
      'A Guarda Argêntea é a guarda de elite associada a Andrastos durante a campanha contra a primeira Horda skelden. Marchou ao norte ao lado de um batalhão de Cavaleiros de Nerânia para enfrentar a invasão e integrar o esforço do Pacto de Ociddens.',
    data: { kind: 'guarda de elite', relacionadoA: ['Andrastos', 'Pacto de Ociddens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'cavaleiros-de-nerania': {
    description:
      'Os Cavaleiros de Nerânia formaram um batalhão que acompanhou Andrastos e a Guarda Argêntea rumo ao norte, durante a guerra contra a primeira Horda skelden no continente Oeste. Sua participação é lembrada como parte do esforço unificado do Pacto de Ociddens.',
    data: { kind: 'ordem de cavalaria', relacionadoA: ['Pacto de Ociddens', 'Andrastos'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'andrastos': {
    description:
      'Andrastos foi o governante de Vallen durante a escalada das invasões skeldianas ao norte da Terra dos Vales. Ao encontrar um porto e uma cidade rudimentar nos Rochedos de Baldren, escolheu a diplomacia e propôs um acordo com um clã invasor: concessão de terras e títulos em troca da proteção do norte de Humma.\n\nO trato desencadeou a reação de Skeld e a formação da primeira Horda. Para proteger o continente Oeste, Andrastos liderou a marcha do Pacto de Ociddens ao norte, acompanhado da Guarda Argêntea e de Cavaleiros de Nerânia. O Pacto venceu após dias de combate, mas Andrastos morreu na batalha. Sua memória permaneceu como símbolo de união e resistência.',
    data: { kind: 'rei/governante', titulo: 'O Unificador (póstumo)', vinculo: 'Vallen' },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'andrastos-o-unificador': {
    description:
      '“Andrastos, o Unificador” é o título dado ao governante de Vallen que enfrentou a crise da primeira Horda skelden. Ele liderou, com a Guarda Argêntea e apoio dos Cavaleiros de Nerânia, o esforço do Pacto de Ociddens que salvou o continente Oeste. Andrastos morreu na campanha; anualmente, no dia de sua morte, celebra-se um festival em sua homenagem em Norbria e em Vallen.',
    data: { kind: 'título honorífico', relacionadoA: ['Andrastos', 'Norbria', 'Vallen'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'quinewen': {
    description:
      'Quínewen é a filha de Andrastos e sucessora no trono de Vallen após a guerra contra a primeira Horda skelden. Ela honrou o acordo firmado por seu pai, permitindo que skeldens se estabelecessem ao norte sob o estandarte de Humma, e consolidou a política de defesa que levaria à construção do forte de Hardenfor e à prosperidade de Norbria.',
    data: { kind: 'rainha/governante', vinculo: 'Vallen' },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'terra-dos-vales': {
    description:
      'A Terra dos Vales é uma região do continente Oeste cuja porção norte foi pressionada pela expansão de clãs skeldens antes e durante a crise da primeira Horda. A área ao norte da Terra dos Vales tornou-se zona de estabelecimento e disputa, ligada à história de Norbria e às campanhas lideradas por Vallen.',
    data: { kind: 'região', relacionadoA: ['Norbria', 'Skeldens', 'Vallen'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'rochedos-de-baldren': {
    description:
      'Os Rochedos de Baldren são uma região costeira rochosa no norte do continente Oeste. Foi ali que Andrastos encontrou um assentamento skelden já consolidado, com porto e embarcações, levando-o a propor um acordo em vez de uma expulsão imediata — um ponto de inflexão que antecede a formação da primeira Horda.',
    data: { kind: 'região/rochedos', relacionadoA: ['Andrastos', 'Norbria'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'humma': {
    description:
      'Humma é uma das coroas do continente Oeste e integrante do Pacto de Ociddens. Na crise da primeira Horda skelden, o norte de Humma era alvo de invasões sazonais; após a guerra, skeldens passaram a se estabelecer na região sob seu estandarte, conforme o acordo mantido por Quínewen.',
    data: { kind: 'coroa/reino', relacionadoA: ['Pacto de Ociddens', 'Skeldens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'noan': {
    description:
      'Noan é uma das coroas do continente Oeste e compõe, junto de Humma e Falandir, o Pacto de Ociddens — aliança criada para conter a ameaça da primeira Horda skelden e proteger a região setentrional.',
    data: { kind: 'coroa/reino', relacionadoA: ['Pacto de Ociddens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'falandir': {
    description:
      'Falandir é uma das coroas do continente Oeste e membro do Pacto de Ociddens, aliança erguida para enfrentar a primeira Horda skelden e impedir que a invasão se tornasse uma ameaça existencial ao continente.',
    data: { kind: 'coroa/reino', relacionadoA: ['Pacto de Ociddens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'cernizza': {
    description:
      'Cernizza é mencionada como um limite alcançado pela expansão territorial skelden no norte da Terra dos Vales, antes da formação da primeira Horda. Seu nome aparece como referência geográfica na cronologia de tensões que culmina nos eventos de Norbria.',
    data: { kind: 'localidade/região', relacionadoA: ['Terra dos Vales', 'Skeldens'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },
  'skeld': {
    description:
      'Skeld é uma grande ilha ao norte de Átrias e lar de diversos clãs skeldens. Também é lembrada como um dos locais onde Khay\'zam ergueu uma torre das Alta\'Arcanas, no esforço de vigiar e controlar a magia após a Ruptura.',
    data: { kind: 'ilha/continente', relacionadoA: ['Skeldens', "Alta'Arcanas"] },
    sourceFile: 'content-inbox/A Magia em Átrias.rtf',
  },
  'skeldens': {
    description:
      'Skeldens são povos/clãs vindos de Skeld, conhecidos por incursões sazonais e grandes invasões ao continente Oeste. A tradição registra que, insatisfeitos com um acordo local proposto por Andrastos, clãs se uniram e formaram a primeira Horda, devastando a região do Lago Teamor. Após a derrota da Horda pelo Pacto de Ociddens, parte dos skeldens passou a se estabelecer ao norte sob o estandarte de Humma.',
    data: { kind: 'povo/clãs', origem: 'Skeld', relacionadoA: ['primeira Horda', 'Norbria', 'Humma'] },
    sourceFile: 'content-inbox/HISTÓRIA DE NORBRIA.docx',
  },

  // --- Contenda do Couro ---
  'contenda-do-couro': {
    description:
      'A Contenda do Couro (Leather Strife) é um jogo-espetáculo de combate, estratégia, velocidade e sorte, disputado por dois times numerosos em uma arena oval repleta de obstáculos, plataformas e estruturas elevadas. Cada time possui 44 jogadores (com 20 em campo) divididos em funções especializadas: carregadores, corredores, baleiros, guardas e batedores.\n\nA partida é regida por uma grande ampulheta de aproximadamente 20 minutos. Em momentos marcados (a cada 5 minutos), sacos de estopa suspensos são liberados, espalhando bolas coloridas de pontuação e bolas especiais, o que desloca o foco do combate pela arena. A pontuação é somada ao final, na plataforma central, com contagem de bolas e verificação do mecanismo de carretilha (um “cabo de guerra” acionado por alvos, que concede bônus).\n\nAlém da coleta de bolas, times marcam pontos destruindo ânforas do adversário (alvos para baleiros) e disputando o controle da carretilha por acertos de batedores. O evento conta com comissão de arbitragem (12 árbitros internos/externos, com apitos que podem parar o tempo) e comissão médica e de resgate para remoção e substituição de jogadores contundidos.',
    data: {
      kind: 'esporte/jogo',
      time: { totalJogadores: 44, emCampo: 20 },
      funcoes: {
        carregadores: 2,
        corredores: 4,
        baleiros: 2,
        guardas: 8,
        batedores: 4,
      },
      duracaoMin: 20,
      marcoEventosMin: [5, 10],
      pontuacao: {
        bolasVermelhas: 1,
        bolasVerdes: 2,
        bolasAmarelas: 5,
        anforaDestruida: 4,
        bonusCarretilha: 10,
      },
      arbitragem: { arbitrosTotal: 12, internos: 8, externos: 4 },
    },
    sourceFile: 'content-inbox/CONTENDA DO COURO.docx',
  },

  // --- Ervas (itens) ---
  'fruta-gelida-azul': {
    description:
      'Uma rosa/fruta naturalmente azul capaz de neutralizar venenos de forma limitada. É resistente e pode ser forrageada em regiões árticas, mas também aparece em prados, planícies e pântanos.',
    data: { kind: 'ingrediente/erva', efeitos: ['neutralização leve de venenos'], biomas: ['ártico', 'prados', 'planícies', 'pântanos'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'seiva-clara': {
    description:
      'Seiva cristalina coletada de grandes árvores em florestas próximas a cadeias de montanhas. Por sua aparência límpida, é difícil de encontrar. Quando devidamente infundida, concede benefícios não naturais à visão.',
    data: { kind: 'ingrediente/erva', biomas: ['florestas em cadeias de montanhas'], efeitos: ['melhora/alteração de visão'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'margarida-encharcada-de-orvalho': {
    description:
      'Margarida roxa com padrão branco pontilhado que lembra gotas de orvalho. Pode ser consumida para curar quase todos os venenos, exceto os mais mortais. Cresce em bordas de montanhas, onde as encostas encontram margens de florestas.',
    data: { kind: 'ingrediente/erva', efeitos: ['cura de venenos (exceto os mais mortais)'], biomas: ['bordas de montanhas', 'margens de florestas'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'bulbo-de-kraken-kelp': {
    description:
      'Bulbo de uma alga extremamente alta (Kraken-Kelp) que cresce em margens muito íngremes. As algas podem ser vistas de praias em vales costeiros; os bulbos costumam se soltar e chegar à costa.',
    data: { kind: 'ingrediente/erva', biomas: ['costas', 'margens íngremes', 'vales de ondas'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'semente-de-lavanda': {
    description:
      'Sementes de lavanda encontradas em prados, planícies e costas arenosas. São fáceis de detectar pelas hastes com flores roxas.',
    data: { kind: 'ingrediente/erva', biomas: ['prados', 'planícies', 'costas arenosas'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'petala-de-cacto-lamica-azul': {
    description:
      'Pétala grossa e bulbosa do cacto Blue Lamica, comum em desertos e dunas. Suas flores azuis brilhantes facilitam a identificação. As pétalas armazenam água de chuva rara e fria e podem ser aplicadas à pele para resfriar alguém.',
    data: { kind: 'ingrediente/erva', biomas: ['desertos', 'dunas'], efeitos: ['resfriamento corporal', 'armazenamento de água'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'grama-lunar': {
    description:
      'Fios de grama com faixas prateadas nas bordas, encontrados em regiões frias e até no topo de montanhas elevadas. Quando sua fumaça é inalada, os vapores ajudam os olhos a se adaptarem à escuridão.',
    data: { kind: 'ingrediente/erva', biomas: ['regiões frias', 'neve', 'topos de montanhas'], efeitos: ['adaptação à escuridão'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'planta-cantaro-mamute': {
    description:
      'Planta de grande porte com “cântaro” (cabeça em forma de caneca) e veias marrom-escuras e bordô. Vive em selvas e florestas tropicais, alimentando-se de insetos que pousam em seu interior. Frequentemente coleta água utilizada pela vida selvagem local.',
    data: { kind: 'ingrediente/erva', biomas: ['selvas', 'florestas tropicais'], caracteristicas: ['carnívora', 'coleta água'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'margarida-temeraria': {
    description:
      'Erva de pétalas rosadas encontrada em florestas. Quando devidamente consumida, seu composto inibe o medo — útil para aventureiros.',
    data: { kind: 'ingrediente/erva', biomas: ['florestas'], efeitos: ['inibição do medo'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'cogumelo-pingo-rubro': {
    description:
      'Cogumelo branco com pequenas manchas vermelhas no chapéu. Cresce em locais úmidos e pouco iluminados, com frequência perto de águas subterrâneas. Inalar seus esporos aguça os sentidos por breve período; doses altas podem causar alucinações.',
    data: { kind: 'ingrediente/erva', biomas: ['umidade', 'áreas escuras', 'perto de águas subterrâneas'], efeitos: ['aguçar sentidos', 'alucinações (dose alta)'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'botao-de-locinto': {
    description:
      'Botão de uma planta laranja vibrante encontrada nas profundezas das selvas. Armazena energia ao sugar nutrientes do ambiente; o botão amadurece rapidamente. Espremido, libera um líquido amarelo que deixa uma criatura revigorada.',
    data: { kind: 'ingrediente/erva', biomas: ['selvas profundas'], efeitos: ['revigoramento/energia'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'hibisco-rubi': {
    description:
      'Flor vermelha brilhante conhecida pelo aroma agradável e pelo gosto ruim. Apesar disso, oferece efeitos benéficos ao corpo. Pode crescer em quase qualquer floresta, mas é rara: cerca de um em cada cem botões floresce como hibisco rubi.',
    data: { kind: 'ingrediente/erva', biomas: ['florestas'], raridade: 'rara', efeitos: ['benefícios corporais'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'tentaculo-de-dros-eara-palida': {
    description:
      'O Tentáculo de Drosêra Pálida vem de uma planta carnívora grande e rara, cujas extrusões semelhantes a tentáculos secretam um aroma doce que atrai insetos. Uma enzima viscosa os cola e começa a dissolvê-los; a planta então absorve e digere a “sopa” nutritiva. Encontrar uma Drosêra Pálida é considerado sinal de boa sorte.',
    data: { kind: 'ingrediente/erva', biomas: ['regiões de insetos abundantes (varia)'], caracteristicas: ['carnívora', 'rara'], efeitos: [] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'junco-esplendor': {
    description:
      'Caule modesto que cresce nas margens e na superfície fresca das águas. Muitas vezes é ignorado por parecer uma planta comum, apesar de ter valor como ingrediente.',
    data: { kind: 'ingrediente/erva', biomas: ['margens de águas frias'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'sonhador-chamuscado': {
    description:
      'Flor roxa escura, semelhante a um lírio, com bordas marcadas nas pétalas. Surge apenas em locais específicos: suas raízes se entrelaçam em plantas próximas, das quais extrai nutrientes, matando o que cresce perto demais. Exala aroma forte e doce; é fácil de localizar, mas difícil de colher sem danificar as raízes.',
    data: { kind: 'ingrediente/erva', caracteristicas: ['predatória', 'raízes emaranhadas'], biomas: ['locais específicos (raros)'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'brasa-espinhosa': {
    description:
      'Flor laranja de crescimento lento, com uma faixa preta em cada pétala. Cresce em cinzas quentes e magma solidificado de origem vulcânica. Suas raízes grossas e espinhosas enterram-se na pedra macia para consumir nutrientes internos.',
    data: { kind: 'ingrediente/erva', biomas: ['regiões vulcânicas', 'cinzas quentes', 'magma solidificado'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'seiva-pedra-fogo': {
    description:
      'Seiva espessa cor de âmbar, com sabor rico e doce, colhida de árvores nas profundezas da floresta. É usada como adoçante e ingrediente de preparo.',
    data: { kind: 'ingrediente/erva', biomas: ['florestas profundas'], usos: ['adoçante'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'nos-de-arvid-retorcida': {
    description:
      'Noz cáqui encontrada dentro de árvores próximas a fontes de água, no centro de uma massa de raízes grossas que se retorcem e se dobram. A maioria cresce até o tamanho de um palmo, mas registros falam de exemplares com mais de 1,5 metro de diâmetro.',
    data: { kind: 'ingrediente/erva', biomas: ['próximo a fontes de água'], curiosidades: ['pode atingir tamanhos enormes em casos raros'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
  'semente-vitalin': {
    description:
      'Semente marrom salpicada com pequenos pontos rosados, de sabor agradavelmente ácido. Pode prevenir a progressão até mesmo de doenças terríveis. É encontrada em florestas densas ou muito esparsas, espalhada pelo solo sob grandes árvores Vitaloans.',
    data: { kind: 'ingrediente/erva', efeitos: ['prevenir progressão de doenças'], biomas: ['florestas densas', 'florestas esparsas'], associadaA: ['árvores Vitaloans'] },
    sourceFile: 'content-inbox/Ervas.rtf',
  },
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  const slugs = Object.keys(patches)

  const beforeRes = await client.query(
    'select id, slug, type, name, coalesce(description,\'\') as description, coalesce(data,\'{}\'::jsonb) as data from entities where slug = any($1)',
    [slugs]
  )

  const beforeBySlug = new Map(beforeRes.rows.map((r) => [r.slug, r]))

  const results: Array<{
    slug: string
    name: string
    type: string
    beforeLen: number
    afterLen: number
  }> = []

  await client.query('begin')
  try {
    for (const slug of slugs) {
      const patch = patches[slug]!
      const before = beforeBySlug.get(slug)
      if (!before) {
        console.warn(`[WARN] slug not found in DB: ${slug}`)
        continue
      }

      const mergedData = {
        ...(before.data ?? {}),
        ...(patch.data ?? {}),
      }

      const afterLen = patch.description.length
      const beforeLen = (before.description ?? '').length

      await client.query(
        'update entities set description = $2, data = $3, source_file = coalesce($4, source_file), updated_at = now() where slug = $1',
        [slug, patch.description, JSON.stringify(mergedData), patch.sourceFile ?? null]
      )

      results.push({
        slug,
        name: before.name,
        type: before.type,
        beforeLen,
        afterLen,
      })
    }

    await client.query('commit')
  } catch (err) {
    await client.query('rollback')
    throw err
  } finally {
    await client.end()
  }

  results.sort((a, b) => b.afterLen - a.afterLen)
  console.log(`Updated ${results.length} entities.`)
  for (const r of results) {
    const delta = r.afterLen - r.beforeLen
    console.log(
      `- [${r.type}] ${r.name} (${r.slug}): ${r.beforeLen} → ${r.afterLen} chars (${delta >= 0 ? '+' : ''}${delta})`
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
