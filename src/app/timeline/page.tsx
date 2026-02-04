'use client'

import { useState } from 'react'
import Link from 'next/link'

// Timeline data - events organized by era
const timelineData = {
  eras: [
    {
      id: 'dawn',
      name: 'Era do Alvorecer',
      nameEn: 'Dawn Era',
      description: 'O início dos tempos, quando os deuses moldaram Átrias',
      color: '#FFD700',
      icon: '☀️',
    },
    {
      id: 'eldaren',
      name: 'Era dos Eldaren',
      nameEn: 'Eldaren Era',
      description: 'O reinado dos imortais e o desenvolvimento da magia arcana',
      color: '#9B59B6',
      icon: '✨',
    },
    {
      id: 'ruptura',
      name: 'A Ruptura',
      nameEn: 'The Rupture',
      description: 'O cataclisma que mudou tudo',
      color: '#E74C3C',
      icon: '💥',
    },
    {
      id: 'chaos',
      name: 'Era do Caos',
      nameEn: 'Age of Chaos',
      description: 'Os anos sombrios após a Ruptura',
      color: '#2C3E50',
      icon: '🌑',
    },
    {
      id: 'reconstruction',
      name: 'Era da Reconstrução',
      nameEn: 'Age of Reconstruction',
      description: 'A lenta recuperação das civilizações',
      color: '#27AE60',
      icon: '🌱',
    },
    {
      id: 'present',
      name: 'Era Atual',
      nameEn: 'Present Era',
      description: 'Os dias atuais em Átrias',
      color: '#3498DB',
      icon: '⚔️',
    },
  ],
  events: [
    // Dawn Era
    {
      id: 1,
      era: 'dawn',
      title: 'Criação de Átrias',
      description: 'Os deuses primordiais moldam o mundo de Átrias a partir do vazio cósmico. Os sete continentes emergem: Skeld, Vellenor, Noan, Elandir, Kandar, Ohan e Morte Gelida.',
      year: '??? Antes da Ruptura',
      category: 'divine',
      importance: 'major',
    },
    {
      id: 2,
      era: 'dawn',
      title: 'Nascimento dos Eldaren',
      description: 'A primeira raça inteligente surge em Átrias — os Eldaren, seres imortais conectados diretamente aos deuses.',
      year: '??? Antes da Ruptura',
      category: 'race',
      importance: 'major',
    },
    // Eldaren Era
    {
      id: 3,
      era: 'eldaren',
      title: 'Sacrifício da Imortalidade',
      description: 'Os Eldaren sacrificam sua imortalidade para ganhar acesso à magia arcana, permitindo-lhes manipular as linhas de ley.',
      year: '~5000 AR',
      category: 'magic',
      importance: 'major',
    },
    {
      id: 4,
      era: 'eldaren',
      title: 'Fundação da Ordem de Ghalbath',
      description: 'Druidas poderosos estabelecem a Ordem de Ghalbath para proteger o equilíbrio natural de Átrias.',
      year: '~4500 AR',
      category: 'faction',
      importance: 'major',
    },
    {
      id: 5,
      era: 'eldaren',
      title: 'Era de Ouro dos Anões de Skeld',
      description: 'Sob a liderança de grandes reis, os anões de Skeld constroem fortalezas subterrâneas que tocam a Pedra-Mãe.',
      year: '~3000 AR',
      category: 'civilization',
      importance: 'minor',
    },
    // The Rupture
    {
      id: 6,
      era: 'ruptura',
      title: 'A Ambição de Kael\'thas',
      description: 'Um mortal poderoso tenta ascender à divindade, realizando rituais proibidos que perfuram o véu entre os planos.',
      year: 'Ano Zero',
      category: 'divine',
      importance: 'major',
    },
    {
      id: 7,
      era: 'ruptura',
      title: 'A Ruptura',
      description: 'O ritual falha catastroficamente. Entidades divinas caem, Senhores Infernais ascendem, e a realidade se fragmenta. Milhões morrem.',
      year: 'Ano Zero',
      category: 'cataclysm',
      importance: 'legendary',
    },
    {
      id: 8,
      era: 'ruptura',
      title: 'Surgimento da Maldição da Ambição',
      description: 'Uma maldição se espalha pelos humanos que manipulam magia arcana, corrompendo suas almas com forças infernais.',
      year: 'Ano Zero',
      category: 'curse',
      importance: 'major',
    },
    {
      id: 9,
      era: 'ruptura',
      title: 'O Destruidor-de-Mundos',
      description: 'Uma força cataclísmica é liberada, subjugando nações inteiras e espalhando caos por todo Átrias.',
      year: 'Ano Zero',
      category: 'cataclysm',
      importance: 'legendary',
    },
    // Age of Chaos
    {
      id: 10,
      era: 'chaos',
      title: 'Queda das Cidades Élficas',
      description: 'As grandes cidades dos Eldaren caem em ruínas. Os sobreviventes se dispersam pelos continentes.',
      year: '1-100 DR',
      category: 'civilization',
      importance: 'major',
    },
    {
      id: 11,
      era: 'chaos',
      title: 'A Obsessão de Thrandorin',
      description: 'O rei anão Thrandorin fica obcecado com a Pedra-Mãe, levando seu povo a consequências terríveis.',
      year: '~200 DR',
      category: 'character',
      importance: 'minor',
    },
    {
      id: 12,
      era: 'chaos',
      title: 'Fundação da Chama Branca',
      description: 'Em meio ao caos, surge a fé da Chama Branca, pregando verdade, justiça e ordem como caminho para a salvação.',
      year: '~300 DR',
      category: 'religion',
      importance: 'major',
    },
    // Age of Reconstruction
    {
      id: 13,
      era: 'reconstruction',
      title: 'Fundação de Norbria',
      description: 'Sobreviventes se unem para fundar Norbria, uma nova esperança no continente de Skeld.',
      year: '~500 DR',
      category: 'civilization',
      importance: 'major',
    },
    {
      id: 14,
      era: 'reconstruction',
      title: 'A Chama de Prata',
      description: 'Uma nova ordem religiosa surge, trazendo esperança e luz para os reinos em reconstrução.',
      year: '~600 DR',
      category: 'religion',
      importance: 'minor',
    },
    {
      id: 15,
      era: 'reconstruction',
      title: 'Criação do Paragon',
      description: 'O esporte Paragon é criado, unindo povos através de competição saudável em vez de guerra.',
      year: '~700 DR',
      category: 'culture',
      importance: 'minor',
    },
    // Present Era
    {
      id: 16,
      era: 'present',
      title: 'Os Improváveis de Solaria',
      description: 'Um grupo improvável de heróis surge em Solaria, enfrentando ameaças antigas que ressurgem.',
      year: '~1000 DR',
      category: 'campaign',
      importance: 'major',
    },
    {
      id: 17,
      era: 'present',
      title: 'As Fúrias de Videnserg',
      description: 'Em Videnserg, guerreiros destemidos enfrentam os horrores remanescentes da Ruptura.',
      year: '~1000 DR',
      category: 'campaign',
      importance: 'major',
    },
    {
      id: 18,
      era: 'present',
      title: 'A Hecatombe',
      description: 'Uma nova ameaça se ergue, prometendo um cataclisma que pode rivalizar com a própria Ruptura.',
      year: 'Presente',
      category: 'threat',
      importance: 'legendary',
    },
  ],
}

const categoryIcons: Record<string, string> = {
  divine: '⚡',
  race: '👥',
  magic: '🔮',
  faction: '🏛️',
  civilization: '🏰',
  cataclysm: '💀',
  curse: '☠️',
  character: '👤',
  religion: '🕯️',
  culture: '🎭',
  campaign: '📜',
  threat: '⚠️',
}

export default function TimelinePage() {
  const [selectedEra, setSelectedEra] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredEvents = timelineData.events.filter((event) => {
    if (selectedEra && event.era !== selectedEra) return false
    if (selectedCategory && event.category !== selectedCategory) return false
    return true
  })

  const categories = [...new Set(timelineData.events.map((e) => e.category))]

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-amber-500/70 hover:text-amber-400 transition-colors mb-6"
          >
            ← Voltar ao Início
          </Link>
          
          <h1 className="font-cinzel text-4xl md:text-6xl font-bold text-amber-100 mb-4">
            Linha do Tempo
          </h1>
          <p className="text-amber-100/60 text-lg max-w-2xl">
            A história de Átrias, desde a criação até os dias atuais. 
            Eventos que moldaram o destino de reinos e civilizações.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Era Pills */}
        <div className="mb-8">
          <h3 className="text-amber-100/60 text-sm uppercase tracking-wider mb-3">Filtrar por Era</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedEra(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedEra === null
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800/50 text-amber-100/70 hover:bg-slate-700/50'
              }`}
            >
              Todas as Eras
            </button>
            {timelineData.eras.map((era) => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedEra === era.id
                    ? 'text-slate-950'
                    : 'bg-slate-800/50 text-amber-100/70 hover:bg-slate-700/50'
                }`}
                style={{
                  backgroundColor: selectedEra === era.id ? era.color : undefined,
                }}
              >
                <span>{era.icon}</span>
                {era.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-12">
          <h3 className="text-amber-100/60 text-sm uppercase tracking-wider mb-3">Filtrar por Categoria</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-slate-800/30 text-amber-100/50 hover:bg-slate-700/30'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-slate-800/30 text-amber-100/50 hover:bg-slate-700/30'
                }`}
              >
                <span>{categoryIcons[cat]}</span>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent transform md:-translate-x-1/2" />

          {/* Events */}
          <div className="space-y-8">
            {timelineData.eras.map((era, eraIndex) => {
              const eraEvents = filteredEvents.filter((e) => e.era === era.id)
              if (eraEvents.length === 0 && selectedEra && selectedEra !== era.id) return null
              if (eraEvents.length === 0 && selectedCategory) return null

              return (
                <div key={era.id} className="relative">
                  {/* Era Header */}
                  <div className={`flex items-center gap-4 mb-6 ${eraIndex % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="hidden md:block flex-1" />
                    <div 
                      className="relative z-10 px-6 py-3 rounded-xl border-2 shadow-lg ml-8 md:ml-0"
                      style={{ 
                        backgroundColor: `${era.color}20`,
                        borderColor: era.color,
                        boxShadow: `0 0 30px ${era.color}30`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{era.icon}</span>
                        <div>
                          <h2 className="font-cinzel text-xl font-bold" style={{ color: era.color }}>
                            {era.name}
                          </h2>
                          <p className="text-amber-100/50 text-sm">{era.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block flex-1" />
                  </div>

                  {/* Era Events */}
                  <div className="space-y-6">
                    {eraEvents.map((event, eventIndex) => {
                      const isLeft = eventIndex % 2 === 0

                      return (
                        <div
                          key={event.id}
                          className={`relative flex items-center ${
                            isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                          }`}
                        >
                          {/* Content */}
                          <div className={`flex-1 ${isLeft ? 'md:pr-8' : 'md:pl-8'} pl-12 md:pl-0`}>
                            <div
                              className={`relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-amber-500/30 transition-all group ${
                                event.importance === 'legendary' ? 'ring-2 ring-amber-500/30' : ''
                              }`}
                            >
                              {/* Importance Badge */}
                              {event.importance === 'legendary' && (
                                <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                                  LENDÁRIO
                                </div>
                              )}

                              {/* Year Badge */}
                              <div className="flex items-center gap-2 mb-2">
                                <span 
                                  className="text-xs font-mono px-2 py-0.5 rounded"
                                  style={{ 
                                    backgroundColor: `${era.color}20`,
                                    color: era.color 
                                  }}
                                >
                                  {event.year}
                                </span>
                                <span className="text-amber-100/40 text-xs flex items-center gap-1">
                                  {categoryIcons[event.category]} {event.category}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="font-cinzel text-lg font-bold text-amber-100 group-hover:text-amber-400 transition-colors">
                                {event.title}
                              </h3>

                              {/* Description */}
                              <p className="text-amber-100/60 text-sm mt-2 leading-relaxed">
                                {event.description}
                              </p>

                              {/* Glow Effect for Legendary */}
                              {event.importance === 'legendary' && (
                                <div 
                                  className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                                  style={{
                                    background: `radial-gradient(ellipse at center, ${era.color}40 0%, transparent 70%)`
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Timeline Node */}
                          <div
                            className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-2 transform md:-translate-x-1/2 z-10"
                            style={{
                              backgroundColor: event.importance === 'legendary' ? era.color : 'rgb(30 41 59)',
                              borderColor: era.color,
                              boxShadow: event.importance === 'legendary' ? `0 0 15px ${era.color}` : undefined
                            }}
                          />

                          {/* Spacer */}
                          <div className="hidden md:block flex-1" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* End of Timeline */}
          <div className="relative mt-12 flex justify-center">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-slate-700/50 text-center">
              <p className="text-amber-100/40 text-sm italic">
                "O futuro ainda não foi escrito..."
              </p>
              <p className="text-amber-100/60 text-xs mt-1">
                — Provérbio da Chama Branca
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-cinzel font-bold text-amber-400">
              {timelineData.eras.length}
            </div>
            <div className="text-amber-100/50 text-sm">Eras</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-cinzel font-bold text-amber-400">
              {timelineData.events.length}
            </div>
            <div className="text-amber-100/50 text-sm">Eventos</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-cinzel font-bold text-amber-400">
              {timelineData.events.filter((e) => e.importance === 'legendary').length}
            </div>
            <div className="text-amber-100/50 text-sm">Lendários</div>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-cinzel font-bold text-amber-400">
              7
            </div>
            <div className="text-amber-100/50 text-sm">Continentes</div>
          </div>
        </div>
      </div>
    </main>
  )
}
