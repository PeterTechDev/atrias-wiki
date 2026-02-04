'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

// Timeline data - events organized by era
const timelineData = {
  eras: [
    {
      id: 'primordial',
      name: 'Era Primordial',
      nameEn: 'Primordial Era',
      description: 'O vazio antes da criação, quando apenas os deuses existiam',
      color: '#6366F1',
      gradient: 'from-indigo-950 via-slate-950 to-purple-950',
      bgStyle: 'cosmic',
      icon: 'game-icons:galaxy',
      ambient: 'Deep cosmic void, stars being born',
    },
    {
      id: 'dawn',
      name: 'Era do Alvorecer',
      nameEn: 'Dawn Era',
      description: 'O nascimento de Átrias e das primeiras raças',
      color: '#FFD700',
      gradient: 'from-amber-950 via-yellow-950 to-orange-950',
      bgStyle: 'golden',
      icon: 'game-icons:sunrise',
      ambient: 'Golden light, divine creation',
    },
    {
      id: 'ancient',
      name: 'Era Antiga',
      nameEn: 'Ancient Era',
      description: 'O reinado dos Eldaren e o apogeu da magia',
      color: '#9B59B6',
      gradient: 'from-purple-950 via-violet-950 to-fuchsia-950',
      bgStyle: 'magical',
      icon: 'game-icons:magic-swirl',
      ambient: 'Magical runes, arcane energy',
    },
    {
      id: 'ruptura',
      name: 'A Ruptura',
      nameEn: 'The Rupture',
      description: 'O cataclisma que destruiu o mundo antigo',
      color: '#E74C3C',
      gradient: 'from-red-950 via-orange-950 to-red-900',
      bgStyle: 'destruction',
      icon: 'game-icons:broken-skull',
      ambient: 'Fire, chaos, world ending',
    },
    {
      id: 'dark',
      name: 'Era das Trevas',
      nameEn: 'Dark Age',
      description: 'Os anos sombrios após a Ruptura',
      color: '#2C3E50',
      gradient: 'from-slate-950 via-gray-950 to-zinc-950',
      bgStyle: 'dark',
      icon: 'game-icons:eclipse',
      ambient: 'Ash, despair, survival',
    },
    {
      id: 'reconstruction',
      name: 'Era da Reconstrução',
      nameEn: 'Age of Reconstruction',
      description: 'A esperança renasce das cinzas',
      color: '#27AE60',
      gradient: 'from-emerald-950 via-green-950 to-teal-950',
      bgStyle: 'hope',
      icon: 'game-icons:sprouting',
      ambient: 'New growth, rebuilding',
    },
    {
      id: 'present',
      name: 'Era Atual',
      nameEn: 'Present Era',
      description: 'Os dias atuais — heróis escrevem a história',
      color: '#D4A574',
      gradient: 'from-amber-900/50 via-stone-900 to-amber-950',
      bgStyle: 'parchment',
      icon: 'game-icons:crossed-swords',
      ambient: 'Adventure, destiny awaits',
    },
  ],
  events: [
    // Primordial Era
    {
      id: 1,
      era: 'primordial',
      title: 'O Vazio Primordial',
      description: 'Antes do tempo, existia apenas o Vazio — um oceano infinito de potencial não realizado.',
      fullStory: 'Nas profundezas do Vazio Primordial, entidades além da compreensão mortal existiam em um estado de pura consciência. Não havia luz, nem escuridão — apenas a possibilidade de tudo que viria a ser. Os primeiros deuses nasceram deste caos, moldando-se a partir da própria essência do nada.',
      year: '∞ Antes da Criação',
      category: 'divine',
      importance: 'legendary',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    {
      id: 2,
      era: 'primordial',
      title: 'Nascimento dos Deuses',
      description: 'As primeiras consciências divinas emergem do Vazio, trazendo luz à escuridão eterna.',
      fullStory: 'Do Vazio surgiram os Primordiais — seres de poder inimaginável que seriam os arquitetos de toda a existência. Cada um carregava um aspecto fundamental: Luz, Escuridão, Ordem, Caos, Vida e Morte. Sua primeira ação foi criar o Tempo, dando início à história.',
      year: '∞ Antes da Criação',
      category: 'divine',
      importance: 'legendary',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    // Dawn Era
    {
      id: 3,
      era: 'dawn',
      title: 'Criação de Átrias',
      description: 'Os deuses moldam o mundo de Átrias a partir do vazio cósmico.',
      fullStory: 'Com mãos divinas, os Primordiais teceram a realidade. Sete continentes emergiram dos mares primordiais: Skeld, o reino dos anões nas montanhas geladas; Vellenor, florestas eternas dos elfos; Noan, planícies douradas dos humanos; Elandir, terras místicas; Kandar, desertos ancestrais; Ohan, ilhas tropicais; e Morte Gelida, o continente proibido no sul.',
      year: 'Ano 1 da Criação',
      category: 'divine',
      importance: 'legendary',
      relatedCharacters: [],
      relatedPlaces: ['Skeld', 'Vellenor', 'Noan', 'Elandir', 'Kandar', 'Ohan', 'Morte Gelida'],
    },
    {
      id: 4,
      era: 'dawn',
      title: 'Nascimento dos Eldaren',
      description: 'A primeira raça inteligente surge — os Eldaren imortais.',
      fullStory: 'Os Eldaren foram os primogênitos, criados diretamente pelo sopro divino. Imortais e belos, eles eram os guardiões do mundo jovem. Sua conexão com os deuses era direta — podiam ouvir as vozes divinas e caminhar entre os planos. Por milênios, foram os únicos senhores de Átrias.',
      year: '~100 DC',
      category: 'race',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Vellenor'],
    },
    {
      id: 5,
      era: 'dawn',
      title: 'As Outras Raças Despertam',
      description: 'Anões emergem das montanhas, humanos das planícies, e outras raças tomam forma.',
      fullStory: 'Enquanto os Eldaren reinavam, outras raças despertavam. Os anões surgiram das profundezas de Skeld, já com martelos nas mãos. Os humanos emergiram em Noan, frágeis mas determinados. Halflings, gnomes, e outras raças menores encontraram seus lares nos cantos do mundo.',
      year: '~500 DC',
      category: 'race',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Skeld', 'Noan'],
    },
    // Ancient Era
    {
      id: 6,
      era: 'ancient',
      title: 'Sacrifício da Imortalidade',
      description: 'Os Eldaren trocam sua imortalidade pelo poder da magia arcana.',
      fullStory: 'Em um ritual que abalou os fundamentos da realidade, os Eldaren fizeram uma escolha que mudaria tudo. Sacrificando sua imortalidade, ganharam acesso às linhas de ley — veias de poder puro que cortavam o mundo. A magia arcana nasceu, e com ela, uma nova era de maravilhas e perigos.',
      year: '~2000 DC',
      category: 'magic',
      importance: 'legendary',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    {
      id: 7,
      era: 'ancient',
      title: 'Fundação da Ordem de Ghalbath',
      description: 'Druidas poderosos criam uma ordem para proteger o equilíbrio natural.',
      fullStory: 'Enquanto a magia arcana se espalhava, alguns viram o perigo de tanto poder descontrolado. Os druidas mais sábios se reuniram e fundaram a Ordem de Ghalbath, jurando proteger o equilíbrio entre civilização e natureza, entre magia e mundo físico.',
      year: '~2500 DC',
      category: 'faction',
      importance: 'major',
      relatedCharacters: ['Regente do Equilíbrio'],
      relatedPlaces: [],
      relatedFactions: ['Ordem de Ghalbath'],
    },
    {
      id: 8,
      era: 'ancient',
      title: 'Era de Ouro dos Anões',
      description: 'Sob grandes reis, os anões de Skeld constroem maravilhas subterrâneas.',
      fullStory: 'As fortalezas anãs atingiram seu apogeu. Cidades inteiras esculpidas na rocha viva, salões que ecoavam com canções de vitória, e minas que tocavam a lendária Pedra-Mãe. O rei Thrandorin liderou esta era dourada, embora sua obsessão com a Pedra-Mãe plantasse sementes de tragédia futura.',
      year: '~3000 DC',
      category: 'civilization',
      importance: 'major',
      relatedCharacters: ['Thrandorin'],
      relatedPlaces: ['Skeld'],
    },
    {
      id: 9,
      era: 'ancient',
      title: 'Ascensão da Chama Branca',
      description: 'Uma nova fé surge, pregando verdade, justiça e ordem.',
      fullStory: 'Das visões de profetas iluminados nasceu a Chama Branca. "Revele a verdade, puna os culpados, corrija o erro" — seus dogmas se espalharam como fogo sagrado. Templos foram erguidos, paladinos foram ordenados, e uma nova força de luz se estabeleceu no mundo.',
      year: '~3500 DC',
      category: 'religion',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: [],
      relatedFactions: ['Chama Branca'],
    },
    // The Rupture
    {
      id: 10,
      era: 'ruptura',
      title: 'A Ambição de Kael\'thas',
      description: 'Um mortal tenta ascender à divindade através de rituais proibidos.',
      fullStory: 'Kael\'thas, o mais poderoso mago de sua era, olhou para os céus e viu não deuses, mas rivais. Reunindo conhecimentos proibidos de mil bibliotecas, ele preparou um ritual que perfuraria o véu entre mortais e divinos. O mundo prendeu a respiração.',
      year: 'Ano Zero',
      category: 'magic',
      importance: 'major',
      relatedCharacters: ['Kael\'thas'],
      relatedPlaces: [],
    },
    {
      id: 11,
      era: 'ruptura',
      title: 'A RUPTURA',
      description: 'O ritual falha. Deuses caem. Demônios ascendem. O mundo quebra.',
      fullStory: 'O ritual de Kael\'thas não o elevou — ele rasgou a realidade. Entidades divinas foram arrancadas de seus tronos celestiais. Senhores Infernais, há muito aprisionados, encontraram rachaduras por onde escapar. Continentes tremeram. Oceanos ferveram. Milhões morreram em instantes. A própria magia enlouqueceu. Este foi o dia em que o mundo antigo morreu.',
      year: 'Ano Zero',
      category: 'cataclysm',
      importance: 'legendary',
      relatedCharacters: ['Kael\'thas'],
      relatedPlaces: [],
    },
    {
      id: 12,
      era: 'ruptura',
      title: 'O Destruidor-de-Mundos',
      description: 'Uma entidade cataclísmica é liberada, subjugando nações inteiras.',
      fullStory: 'Das fendas entre os planos emergiu algo que não deveria existir — o Destruidor-de-Mundos. Nem demônio nem deus, era pura entropia encarnada. Onde pisava, civilizações viravam pó. Onde olhava, esperanças morriam. Exércitos inteiros foram consumidos tentando detê-lo.',
      year: 'Ano Zero',
      category: 'cataclysm',
      importance: 'legendary',
      relatedCharacters: ['Destruidor-de-Mundos'],
      relatedPlaces: [],
    },
    {
      id: 13,
      era: 'ruptura',
      title: 'Surgimento da Maldição da Ambição',
      description: 'Uma maldição corrompe todos que usam magia arcana de forma imprudente.',
      fullStory: 'Como eco do pecado de Kael\'thas, uma maldição se espalhou pelos praticantes de magia. A Maldição da Ambição sussurrava promessas de poder, corrompendo almas, transformando magos em cascas de seus antigos eus. A magia, antes dádiva, tornou-se também maldição.',
      year: 'Ano Zero — Anos Seguintes',
      category: 'curse',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    // Dark Age
    {
      id: 14,
      era: 'dark',
      title: 'Queda das Cidades Élficas',
      description: 'As grandes metrópoles dos Eldaren desmoronam em ruínas.',
      fullStory: 'As torres de cristal que tocavam as nuvens caíram uma a uma. Bibliotecas com o conhecimento de milênios queimaram. Os Eldaren, já mortais desde o Sacrifício, viram seus números dizimados. Os sobreviventes se dispersaram, escondendo-se em florestas remotas, guardando fragmentos de glória passada.',
      year: '1-100 DR',
      category: 'civilization',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Vellenor'],
    },
    {
      id: 15,
      era: 'dark',
      title: 'A Obsessão de Thrandorin',
      description: 'O rei anão mergulha na loucura buscando a Pedra-Mãe.',
      fullStory: 'Enquanto o mundo ardia, Thrandorin cavou mais fundo. A Pedra-Mãe, dizia ele, salvaria seu povo. Mas cada metro escavado trazia apenas mais obsessão. Seus conselheiros o abandonaram. Seus filhos o temiam. E nas profundezas, algo antigo despertou, atraído por sua ambição cega.',
      year: '~200 DR',
      category: 'character',
      importance: 'minor',
      relatedCharacters: ['Thrandorin'],
      relatedPlaces: ['Skeld'],
    },
    {
      id: 16,
      era: 'dark',
      title: 'A Longa Noite',
      description: 'Décadas de escuridão, fome e desespero assolam todos os povos.',
      fullStory: 'O sol parecia mais fraco. As colheitas falhavam. Monstros vagavam livremente. Esta foi a Longa Noite — não uma escuridão literal, mas uma era onde a esperança era a coisa mais rara. Comunidades se fecharam. Confiança morreu. Sobreviver era a única vitória possível.',
      year: '100-400 DR',
      category: 'cataclysm',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    // Reconstruction
    {
      id: 17,
      era: 'reconstruction',
      title: 'Fundação de Norbria',
      description: 'Das cinzas, sobreviventes erguem uma nova nação.',
      fullStory: 'Em Skeld, onde antes havia apenas ruínas, um grupo de sobreviventes de todas as raças se uniu. Não importava se eram humanos, anões ou meio-elfos — todos eram filhos da catástrofe. Juntos, fundaram Norbria, uma nação construída não em orgulho racial, mas em sobrevivência compartilhada.',
      year: '~500 DR',
      category: 'civilization',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Norbria', 'Skeld'],
    },
    {
      id: 18,
      era: 'reconstruction',
      title: 'A Chama de Prata',
      description: 'Uma nova ordem religiosa traz esperança aos desesperados.',
      fullStory: 'Da Chama Branca nasceu a Chama de Prata — não uma religião de julgamento, mas de compaixão. Seus sacerdotes não pregavam em templos dourados, mas caminhavam entre os refugiados, curando feridas, alimentando famintos. Onde passavam, comunidades renasciam.',
      year: '~600 DR',
      category: 'religion',
      importance: 'minor',
      relatedCharacters: [],
      relatedPlaces: [],
      relatedFactions: ['Chama de Prata'],
    },
    {
      id: 19,
      era: 'reconstruction',
      title: 'O Pacto das Raças',
      description: 'Pela primeira vez, todas as raças assinam um tratado de paz.',
      fullStory: 'Em uma clareira sagrada, representantes de humanos, elfos, anões, halflings e até alguns orcs civilizados se reuniram. O Pacto das Raças não era apenas um tratado — era uma promessa de que nunca mais a ambição de um destruiria o mundo de todos. As antigas rivalidades não desapareceram, mas ganharam limites.',
      year: '~700 DR',
      category: 'politics',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    {
      id: 20,
      era: 'reconstruction',
      title: 'Criação do Paragon',
      description: 'Um esporte une povos através de competição honrada.',
      fullStory: 'Para canalizar a agressão natural das raças guerreiras, foi criado o Paragon — um esporte brutal mas regrado. Times de diferentes nações competiam em arenas, substituindo guerras por rivalidades esportivas. As torcidas eram ferozes, mas o sangue derramado era voluntário.',
      year: '~800 DR',
      category: 'culture',
      importance: 'minor',
      relatedCharacters: [],
      relatedPlaces: [],
    },
    // Present Era
    {
      id: 21,
      era: 'present',
      title: 'Os Improváveis de Solaria',
      description: 'Um grupo improvável de heróis surge para enfrentar ameaças antigas.',
      fullStory: 'Ninguém esperava que eles se tornariam heróis. Um ladrão, um clérigo duvidoso, um bárbaro com coração mole, uma maga com segredos demais. Mas quando as sombras do passado começaram a se mover em Solaria, foram estes Improváveis que responderam ao chamado.',
      year: '~1000 DR',
      category: 'campaign',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Solaria'],
    },
    {
      id: 22,
      era: 'present',
      title: 'As Fúrias de Videnserg',
      description: 'Guerreiros enfrentam os horrores remanescentes da Ruptura.',
      fullStory: 'Em Videnserg, onde as cicatrizes da Ruptura ainda sangram, um grupo de guerreiros destemidos caça as aberrações que escaparam daquele dia terrível. Cada missão os leva mais fundo no horror, mais perto da verdade sobre o que realmente aconteceu no Ano Zero.',
      year: '~1000 DR',
      category: 'campaign',
      importance: 'major',
      relatedCharacters: [],
      relatedPlaces: ['Videnserg'],
    },
    {
      id: 23,
      era: 'present',
      title: 'Sussurros da Hecatombe',
      description: 'Profecias falam de uma nova catástrofe que pode superar a Ruptura.',
      fullStory: 'Nos cantos escuros do mundo, cultistas sussurram sobre a Hecatombe — um evento que fará a Ruptura parecer um prelúdio. Símbolos antigos reaparecem. Criaturas há muito adormecidas despertam. E em sonhos febris, videntes veem um futuro de cinzas absolutas.',
      year: 'Presente',
      category: 'threat',
      importance: 'legendary',
      relatedCharacters: [],
      relatedPlaces: [],
    },
  ],
}

const categoryConfig: Record<string, { icon: string; label: string; color: string }> = {
  divine: { icon: 'game-icons:angel-wings', label: 'Divino', color: '#FFD700' },
  race: { icon: 'game-icons:three-friends', label: 'Raças', color: '#9B59B6' },
  magic: { icon: 'game-icons:crystal-ball', label: 'Magia', color: '#3498DB' },
  faction: { icon: 'game-icons:rally-the-troops', label: 'Facções', color: '#27AE60' },
  civilization: { icon: 'game-icons:castle', label: 'Civilização', color: '#E67E22' },
  cataclysm: { icon: 'game-icons:skull-crack', label: 'Cataclismos', color: '#E74C3C' },
  curse: { icon: 'game-icons:death-note', label: 'Maldições', color: '#8E44AD' },
  character: { icon: 'game-icons:cowled', label: 'Personagens', color: '#1ABC9C' },
  religion: { icon: 'game-icons:prayer', label: 'Religião', color: '#F39C12' },
  culture: { icon: 'game-icons:theater', label: 'Cultura', color: '#E91E63' },
  campaign: { icon: 'game-icons:scroll-unfurled', label: 'Campanhas', color: '#00BCD4' },
  threat: { icon: 'game-icons:burning-skull', label: 'Ameaças', color: '#FF5722' },
  politics: { icon: 'game-icons:throne-king', label: 'Política', color: '#9C27B0' },
}

// Parallax background components for each era style
function CosmicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950" />
      {/* Stars */}
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}
      {/* Nebula effect */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />
    </div>
  )
}

function GoldenBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-yellow-950 to-orange-950" />
      {/* Sun rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-amber-500/30 via-amber-500/10 to-transparent" />
      {/* Golden particles */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-amber-400/40 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  )
}

function MagicalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-violet-950 to-fuchsia-950" />
      {/* Runes floating */}
      {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'].map((rune, i) => (
        <div
          key={i}
          className="absolute text-4xl text-purple-400/20 animate-pulse font-serif"
          style={{
            left: `${10 + (i * 9)}%`,
            top: `${20 + Math.sin(i) * 30}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {rune}
        </div>
      ))}
      {/* Magical orbs */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-radial from-violet-500/30 via-transparent to-transparent animate-pulse" />
    </div>
  )
}

function DestructionBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-950 via-orange-950 to-red-900" />
      {/* Embers */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-orange-500 rounded-full animate-ember"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: '0%',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
      {/* Cracks */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M20,100 L25,60 L15,40 L30,0" stroke="#ff4444" strokeWidth="0.5" fill="none" />
          <path d="M50,100 L45,70 L55,50 L40,20 L60,0" stroke="#ff4444" strokeWidth="0.5" fill="none" />
          <path d="M80,100 L75,80 L85,60 L70,30 L90,0" stroke="#ff4444" strokeWidth="0.5" fill="none" />
        </svg>
      </div>
    </div>
  )
}

function DarkBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-gray-950 to-zinc-950" />
      {/* Fog layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800/20 via-transparent to-gray-800/10" />
      {/* Ash particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gray-600/30 rounded-full animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

function HopeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-green-950 to-teal-950" />
      {/* Growing vines */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-green-900/30 to-transparent" />
      {/* Leaves */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-sway"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        >
          🌿
        </div>
      ))}
      {/* Light rays */}
      <div className="absolute top-0 right-1/4 w-64 h-full bg-gradient-to-b from-emerald-400/10 via-transparent to-transparent transform -skew-x-12" />
    </div>
  )
}

function ParchmentBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/50 via-stone-900 to-amber-950" />
      {/* Parchment texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Ink splatters */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-amber-800/20 rounded-full blur-xl" />
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-amber-700/15 rounded-full blur-2xl" />
    </div>
  )
}

const backgrounds: Record<string, React.FC> = {
  cosmic: CosmicBackground,
  golden: GoldenBackground,
  magical: MagicalBackground,
  destruction: DestructionBackground,
  dark: DarkBackground,
  hope: HopeBackground,
  parchment: ParchmentBackground,
}

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [witnessMode, setWitnessMode] = useState(false)
  const [witnessIndex, setWitnessIndex] = useState(0)
  const [currentEraIndex, setCurrentEraIndex] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const filteredEvents = timelineData.events.filter((event) => {
    if (selectedEra && event.era !== selectedEra) return false
    if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) return false
    return true
  })

  const categories = [...new Set(timelineData.events.map((e) => e.category))]

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  // Witness History Mode
  const startWitnessMode = useCallback(() => {
    setWitnessMode(true)
    setWitnessIndex(0)
    setSelectedEra(null)
    setSelectedCategories([])
    setExpandedEvent(null)
  }, [])

  const stopWitnessMode = useCallback(() => {
    setWitnessMode(false)
    setWitnessIndex(0)
  }, [])

  useEffect(() => {
    if (!witnessMode) return

    const events = timelineData.events
    if (witnessIndex >= events.length) {
      // End of timeline
      setTimeout(() => {
        setWitnessMode(false)
      }, 3000)
      return
    }

    const currentEvent = events[witnessIndex]
    const eraIndex = timelineData.eras.findIndex((e) => e.id === currentEvent.era)
    setCurrentEraIndex(eraIndex)

    // Auto-expand current event
    setExpandedEvent(currentEvent.id)

    // Scroll to event
    const eventElement = document.getElementById(`event-${currentEvent.id}`)
    if (eventElement) {
      eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Move to next event
    const delay = currentEvent.importance === 'legendary' ? 6000 : 4000
    const timer = setTimeout(() => {
      setWitnessIndex((prev) => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [witnessMode, witnessIndex])

  // Track scroll for era background
  useEffect(() => {
    if (witnessMode) return

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-era]')
      let currentEra = 0

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= window.innerHeight / 2) {
          currentEra = index
        }
      })

      setCurrentEraIndex(currentEra)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [witnessMode])

  const CurrentBackground = backgrounds[timelineData.eras[currentEraIndex]?.bgStyle || 'cosmic']

  return (
    <main className="min-h-screen relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 transition-all duration-1000">
        <CurrentBackground />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-amber-500/70 hover:text-amber-400 transition-colors"
                >
                  ← Início
                </Link>
                <h1 className="font-cinzel text-2xl font-bold text-amber-100">
                  Linha do Tempo
                </h1>
              </div>

              {/* Witness History Button */}
              {!witnessMode ? (
                <button
                  onClick={startWitnessMode}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-900/50"
                >
                  <span>▶</span>
                  Witness History
                </button>
              ) : (
                <button
                  onClick={stopWitnessMode}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <span>⏹</span>
                  Parar
                </button>
              )}
            </div>

            {/* Era Progress (Witness Mode) */}
            {witnessMode && (
              <div className="mt-4">
                <div className="flex gap-1">
                  {timelineData.eras.map((era, i) => (
                    <div
                      key={era.id}
                      className="flex-1 h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor:
                          i <= currentEraIndex ? era.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-center mt-2 text-amber-100/60 text-sm">
                  {timelineData.eras[currentEraIndex]?.name} — {timelineData.eras[currentEraIndex]?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filters (hidden in witness mode) */}
        {!witnessMode && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Era Pills */}
            <div className="mb-6">
              <h3 className="text-amber-100/60 text-sm uppercase tracking-wider mb-3">
                Filtrar por Era
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEra(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedEra === null
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white/10 text-amber-100/70 hover:bg-white/20'
                  }`}
                >
                  Todas
                </button>
                {timelineData.eras.map((era) => (
                  <button
                    key={era.id}
                    onClick={() => setSelectedEra(era.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedEra === era.id
                        ? 'text-slate-950'
                        : 'bg-white/10 text-amber-100/70 hover:bg-white/20'
                    }`}
                    style={{
                      backgroundColor: selectedEra === era.id ? era.color : undefined,
                    }}
                  >
                    <Icon icon={era.icon} className="w-5 h-5" />
                    {era.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Toggle Buttons */}
            <div className="mb-8">
              <h3 className="text-amber-100/60 text-sm uppercase tracking-wider mb-3">
                Categorias
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const config = categoryConfig[cat]
                  const isSelected = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'border-current'
                          : 'border-transparent bg-white/10 hover:bg-white/20'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${config.color}30` : undefined,
                        color: isSelected ? config.color : 'rgba(255,255,255,0.7)',
                        borderColor: isSelected ? config.color : undefined,
                      }}
                    >
                      <Icon icon={config.icon} className="w-4 h-4" />
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div ref={timelineRef} className="max-w-4xl mx-auto px-4 pb-32">
          {timelineData.eras.map((era, eraIndex) => {
            const eraEvents = filteredEvents.filter((e) => e.era === era.id)
            if (eraEvents.length === 0 && !witnessMode) return null

            return (
              <div key={era.id} data-era={era.id} className="relative mb-16">
                {/* Era Header */}
                <div className="sticky top-24 z-40 mb-8">
                  <div
                    className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-2xl"
                    style={{
                      backgroundColor: `${era.color}20`,
                      borderColor: `${era.color}50`,
                      boxShadow: `0 0 60px ${era.color}20`,
                    }}
                  >
                    <Icon icon={era.icon} className="w-10 h-10" style={{ color: era.color }} />
                    <div>
                      <h2
                        className="font-cinzel text-2xl font-bold"
                        style={{ color: era.color }}
                      >
                        {era.name}
                      </h2>
                      <p className="text-amber-100/60 text-sm">{era.description}</p>
                    </div>
                  </div>
                </div>

                {/* Era Events */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div
                    className="absolute left-8 top-0 bottom-0 w-1 rounded-full"
                    style={{
                      background: `linear-gradient(to bottom, ${era.color}, ${era.color}50, transparent)`,
                    }}
                  />

                  {/* Events */}
                  <div className="space-y-6">
                    {eraEvents.map((event) => {
                      const isExpanded = expandedEvent === event.id
                      const catConfig = categoryConfig[event.category]
                      const isWitnessing = witnessMode && timelineData.events[witnessIndex]?.id === event.id

                      return (
                        <div
                          key={event.id}
                          id={`event-${event.id}`}
                          className={`relative pl-20 transition-all duration-500 ${
                            isWitnessing ? 'scale-105' : ''
                          }`}
                        >
                          {/* Timeline Node */}
                          <div
                            className={`absolute left-6 w-5 h-5 rounded-full border-4 transition-all duration-500 ${
                              isWitnessing ? 'scale-150' : ''
                            }`}
                            style={{
                              backgroundColor:
                                event.importance === 'legendary' ? era.color : '#1e293b',
                              borderColor: era.color,
                              boxShadow:
                                event.importance === 'legendary' || isWitnessing
                                  ? `0 0 20px ${era.color}`
                                  : undefined,
                            }}
                          />

                          {/* Event Card */}
                          <div
                            onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                            className={`cursor-pointer bg-black/40 backdrop-blur-md rounded-2xl border transition-all duration-500 hover:border-opacity-100 ${
                              event.importance === 'legendary'
                                ? 'ring-2 ring-opacity-50'
                                : ''
                            } ${isWitnessing ? 'ring-4' : ''}`}
                            style={{
                              borderColor: `${era.color}50`,
                              ['--tw-ring-color' as string]: era.color,
                            }}
                          >
                            {/* Card Header */}
                            <div className="p-5">
                              {/* Badges */}
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span
                                  className="text-xs font-mono px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${era.color}30`,
                                    color: era.color,
                                  }}
                                >
                                  {event.year}
                                </span>
                                <span
                                  className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
                                  style={{
                                    backgroundColor: `${catConfig.color}20`,
                                    color: catConfig.color,
                                  }}
                                >
                                  <Icon icon={catConfig.icon} className="w-3 h-3 inline" /> {catConfig.label}
                                </span>
                                {event.importance === 'legendary' && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                                    LENDÁRIO
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-cinzel text-xl font-bold text-amber-100 mb-2">
                                {event.title}
                              </h3>

                              {/* Description */}
                              <p className="text-amber-100/70 text-sm leading-relaxed">
                                {event.description}
                              </p>

                              {/* Expand indicator */}
                              <div className="mt-3 flex items-center gap-2 text-amber-500/60 text-xs">
                                <span>{isExpanded ? '▼' : '▶'}</span>
                                <span>Clique para {isExpanded ? 'fechar' : 'expandir'}</span>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="px-5 pb-5 border-t border-white/10 pt-4 animate-fadeIn">
                                <h4 className="text-amber-400 font-semibold mb-2">
                                  A História Completa
                                </h4>
                                <p className="text-amber-100/80 text-sm leading-relaxed mb-4">
                                  {event.fullStory}
                                </p>

                                {/* Related Links */}
                                {(event.relatedCharacters?.length > 0 ||
                                  event.relatedPlaces?.length > 0 ||
                                  (event as any).relatedFactions?.length > 0) && (
                                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                                    {event.relatedCharacters?.length > 0 && (
                                      <div>
                                        <span className="text-amber-100/50 text-xs uppercase">
                                          Personagens:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {event.relatedCharacters.map((char) => (
                                            <Link
                                              key={char}
                                              href={`/characters/${char.toLowerCase().replace(/\s+/g, '-')}`}
                                              className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Icon icon="game-icons:cowled" className="w-3 h-3 inline mr-1" />{char}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {event.relatedPlaces?.length > 0 && (
                                      <div>
                                        <span className="text-amber-100/50 text-xs uppercase">
                                          Lugares:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {event.relatedPlaces.map((place) => (
                                            <Link
                                              key={place}
                                              href={`/places/${place.toLowerCase().replace(/\s+/g, '-')}`}
                                              className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded hover:bg-emerald-500/30 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Icon icon="game-icons:castle" className="w-3 h-3 inline mr-1" />{place}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {(event as any).relatedFactions?.length > 0 && (
                                      <div>
                                        <span className="text-amber-100/50 text-xs uppercase">
                                          Facções:
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {(event as any).relatedFactions.map((faction: string) => (
                                            <Link
                                              key={faction}
                                              href={`/factions/${faction.toLowerCase().replace(/\s+/g, '-')}`}
                                              className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/30 transition-colors"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Icon icon="game-icons:rally-the-troops" className="w-3 h-3 inline mr-1" />{faction}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Legendary Glow */}
                            {event.importance === 'legendary' && (
                              <div
                                className="absolute inset-0 rounded-2xl pointer-events-none"
                                style={{
                                  background: `radial-gradient(ellipse at center, ${era.color}15 0%, transparent 70%)`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* End of Timeline */}
          {!witnessMode && (
            <div className="text-center py-16">
              <div className="inline-block bg-black/40 backdrop-blur-md rounded-2xl px-8 py-6 border border-amber-500/20">
                <p className="text-amber-100/60 italic text-lg font-serif">
                  "O futuro ainda não foi escrito..."
                </p>
                <p className="text-amber-500/60 text-sm mt-2">
                  — Provérbio da Chama Branca
                </p>
              </div>
            </div>
          )}

          {/* Witness Mode End Screen */}
          {witnessMode && witnessIndex >= timelineData.events.length && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 animate-fadeIn">
              <div className="text-center">
                <h2 className="font-cinzel text-4xl text-amber-400 mb-4">
                  Você Testemunhou a História
                </h2>
                <p className="text-amber-100/60 text-lg mb-8">
                  {timelineData.eras.length} eras. {timelineData.events.length} eventos.
                  <br />
                  Uma história épica de criação, destruição e esperança.
                </p>
                <button
                  onClick={stopWitnessMode}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all"
                >
                  Explorar a Timeline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {!witnessMode && (
          <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-black/50 border-t border-white/10 py-3 z-40">
            <div className="max-w-6xl mx-auto px-4 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-400">
                  {timelineData.eras.length}
                </div>
                <div className="text-amber-100/50 text-xs">Eras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-400">
                  {filteredEvents.length}
                </div>
                <div className="text-amber-100/50 text-xs">Eventos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-400">
                  {filteredEvents.filter((e) => e.importance === 'legendary').length}
                </div>
                <div className="text-amber-100/50 text-xs">Lendários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-cinzel font-bold text-amber-400">7</div>
                <div className="text-amber-100/50 text-xs">Continentes</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.8; }
        }
        @keyframes ember {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-ember { animation: ember 3s ease-out infinite; }
        .animate-fall { animation: fall 8s linear infinite; }
        .animate-sway { animation: sway 3s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </main>
  )
}
