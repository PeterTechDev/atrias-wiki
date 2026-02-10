/**
 * Câmara Hiperbólica do Tempo ⏳
 * Training ground / character reference / session prep hub
 * Named after Dragon Ball Z's Hyperbolic Time Chamber
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

// Character data for the Aventureiros da Guilda
const characters = [
  {
    name: 'Santiago',
    player: 'Peter',
    class: 'Mago — Ordem dos Escribas',
    level: 3,
    race: 'Humano',
    color: 'from-purple-600 to-indigo-800',
    icon: 'game-icons:spell-book',
    hp: 18,
    ac: 12,
    traits: ['Grimório Desperto', 'Caderno da Mãe', 'Colar da Clareira'],
    description: 'Um mago que aprendeu magia não por dom, mas por teimosia e perda. Seu grimório é a herança de sua mãe — metade memória, metade enigma.',
    spells: {
      cantrips: ['Rajada de Fogo', 'Luz', 'Mão de Mago', 'Prestidigitação'],
      level1: ['Mísseis Mágicos', 'Escudo', 'Detectar Magia', 'Encontrar Familiar', 'Sono', 'Identificação'],
      level2: ['Invisibilidade', 'Teia'],
    },
    quote: '"Eu já estive na Mortalha antes. Ela me devolveu. Ainda não sei por quê."',
  },
  {
    name: 'Roan',
    player: 'Rafael',
    class: 'Guerreiro',
    level: 3,
    race: 'Humano',
    color: 'from-red-700 to-red-900',
    icon: 'game-icons:sword-brandish',
    hp: 28,
    ac: 18,
    traits: ['Compostura Inabalável', 'Postura Defensiva'],
    description: 'Um guerreiro disciplinado que não foge e não ataca sem razão. Sua compostura diante do Eco da Mortalha despertou algo na criatura.',
    spells: null,
    quote: null,
  },
  {
    name: 'Ruviel',
    player: 'Marcos',
    class: 'Bardo',
    level: 3,
    race: 'Desconhecida',
    color: 'from-emerald-600 to-teal-800',
    icon: 'game-icons:lyre',
    hp: 22,
    ac: 14,
    traits: ['Inspiração Bárdica', 'Investigador Nato'],
    description: 'O bardo que age primeiro e pergunta depois. Foi o primeiro a investigar Ingram na enfermaria. Curioso e socialmente habilidoso.',
    spells: null,
    quote: null,
  },
  {
    name: 'Versper',
    player: 'Ítalo',
    class: 'Druida / Clérigo',
    level: 3,
    race: 'Desconhecida',
    color: 'from-sky-600 to-cyan-800',
    icon: 'game-icons:oak-leaf',
    hp: 24,
    ac: 16,
    traits: ['Percepção Sobrenatural', 'Conexão com a Natureza'],
    description: 'O primeiro a perceber a dissonância no ambiente quando o Eco apareceu. Olha para as estrelas como quem lê um mapa que só ele enxerga. Desferiu o golpe final no Eco.',
    spells: null,
    quote: null,
  },
  {
    name: 'Aldren',
    player: 'Vinícius',
    class: 'Artificer',
    level: 3,
    race: 'Desconhecida',
    color: 'from-amber-600 to-orange-800',
    icon: 'game-icons:gear-hammer',
    hp: 22,
    ac: 16,
    traits: ['Cão Mecânico', 'Visões Tecnológicas'],
    description: 'O artificer e seu cão mecânico de engrenagens. O pavor do Eco desbloqueou algo nele — visões do que sua tecnologia poderia causar. Ficou paralisado enquanto os outros lutavam.',
    spells: null,
    quote: null,
  },
]

// Session recap timeline
const timeline = [
  {
    session: 1,
    title: 'Cartão de Visitas',
    date: '04/02/2026',
    events: [
      'Convocados por Sigard na sala de reuniões da Guilda',
      'Missão cinza: encontrar aventureira desaparecida na Mortalha',
      'Ingram inconsciente — pupilas viradas, arritmia, sem marcas',
      'Viagem com caravana ao Forte da Aliança',
      'Acampamento na borda da Mortalha',
      'Encontro com o Eco da Mortalha',
      'Roan não fugiu — Eco ficou obcecado',
      'Aldren paralisado por visões internas',
      'Eco desvaneceu após golpe de Versper',
    ],
    unresolved: [
      'Quem enviou a aventureira sozinha?',
      'O que aconteceu com Ingram? (sem marcas externas)',
      'Por que Ralf e Ingram voltaram por caminho diferente?',
      'O que o Eco viu em Roan?',
      'O que Aldren viu nas suas visões?',
    ],
  },
]

// Quick reference tables
const conditions = [
  { name: 'Amedrontado', icon: '😨', effect: 'Desvantagem em testes de habilidade e ataques enquanto a fonte do medo estiver visível. Não pode se mover voluntariamente para mais perto da fonte.' },
  { name: 'Envenenado', icon: '🤢', effect: 'Desvantagem em jogadas de ataque e testes de habilidade.' },
  { name: 'Derrubado', icon: '🔻', effect: 'Ataques corpo a corpo contra têm vantagem. Ataques à distância contra têm desvantagem. Levantar custa metade do movimento.' },
  { name: 'Invisível', icon: '👻', effect: 'Impossível de ver sem magia. Vantagem em ataques, atacantes têm desvantagem.' },
  { name: 'Incapacitado', icon: '💫', effect: 'Não pode realizar ações ou reações.' },
  { name: 'Atordoado', icon: '⭐', effect: 'Incapacitado, não pode se mover, fala balbuciada. Falha automática em testes de Força e Destreza. Ataques contra têm vantagem.' },
]

type Tab = 'characters' | 'timeline' | 'reference' | 'notes'

export default function ChamberPage() {
  const [activeTab, setActiveTab] = useState<Tab>('characters')
  const [selectedChar, setSelectedChar] = useState<typeof characters[0] | null>(null)
  const [notes, setNotes] = useState('')

  // Load saved notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chamber-notes')
      if (saved) setNotes(saved)
    }
  }, [])

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'characters', label: 'Personagens', icon: 'game-icons:armor-vest' },
    { id: 'timeline', label: 'Timeline', icon: 'game-icons:scroll-quill' },
    { id: 'reference', label: 'Referência', icon: 'game-icons:bookmarklet' },
    { id: 'notes', label: 'Notas', icon: 'game-icons:quill-ink' },
  ]

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="bg-[#0a1628] border-b border-amber-900/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <div className="text-center">
            <h1 className="font-cinzel text-amber-400 text-xl md:text-2xl tracking-wide flex items-center gap-3">
              <Icon icon="game-icons:hourglass" className="w-7 h-7" />
              Câmara Hiperbólica do Tempo
            </h1>
            <p className="text-slate-500 text-xs mt-1 italic font-crimson">
              &ldquo;Um dia lá dentro, um ano lá fora.&rdquo;
            </p>
          </div>
          <div className="w-24" /> {/* spacer */}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-amber-900/30 bg-[#0d1f35]/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div>
            {/* Character Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {characters.map((char) => (
                <button
                  key={char.name}
                  onClick={() => setSelectedChar(selectedChar?.name === char.name ? null : char)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedChar?.name === char.name
                      ? 'border-amber-500/50 bg-amber-900/10 ring-1 ring-amber-500/30'
                      : 'border-amber-900/20 bg-[#0d1f35]/80 hover:border-amber-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${char.color} flex items-center justify-center`}>
                      <Icon icon={char.icon} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-cinzel text-amber-400 text-lg">{char.name}</h3>
                      <p className="text-slate-500 text-xs">{char.player} • {char.class}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mb-2">
                    <span className="text-red-400">❤️ HP: {char.hp}</span>
                    <span className="text-sky-400">🛡️ AC: {char.ac}</span>
                    <span className="text-amber-400">⭐ Nv. {char.level}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{char.description}</p>
                </button>
              ))}
            </div>

            {/* Selected Character Detail */}
            {selectedChar && (
              <div className="bg-[#0d1f35] border border-amber-900/30 rounded-xl p-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedChar.color} flex items-center justify-center`}>
                    <Icon icon={selectedChar.icon} className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="font-cinzel text-amber-400 text-2xl">{selectedChar.name}</h2>
                    <p className="text-slate-400">{selectedChar.class} • Nível {selectedChar.level} • {selectedChar.race}</p>
                  </div>
                </div>

                {selectedChar.quote && (
                  <blockquote className="border-l-2 border-amber-600/50 pl-4 mb-6 italic text-slate-300 font-crimson text-lg">
                    {selectedChar.quote}
                  </blockquote>
                )}

                {/* Traits */}
                <div className="mb-6">
                  <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-2">Traços Notáveis</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChar.traits.map((trait) => (
                      <span key={trait} className="px-3 py-1 bg-amber-900/20 border border-amber-900/30 rounded-full text-amber-300 text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Spells */}
                {selectedChar.spells && (
                  <div>
                    <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-3">Magias Conhecidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <h4 className="text-slate-400 text-xs uppercase mb-2">Truques</h4>
                        <ul className="space-y-1">
                          {selectedChar.spells.cantrips.map((s) => (
                            <li key={s} className="text-sm text-slate-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <h4 className="text-slate-400 text-xs uppercase mb-2">Nível 1</h4>
                        <ul className="space-y-1">
                          {selectedChar.spells.level1.map((s) => (
                            <li key={s} className="text-sm text-slate-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <h4 className="text-slate-400 text-xs uppercase mb-2">Nível 2</h4>
                        <ul className="space-y-1">
                          {selectedChar.spells.level2.map((s) => (
                            <li key={s} className="text-sm text-slate-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="font-cinzel text-amber-400 text-xl mb-6">Linha do Tempo — Missões da Guilda</h2>
            {timeline.map((session) => (
              <div key={session.session} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-600/40 flex items-center justify-center font-cinzel text-amber-400 font-bold">
                    {session.session}
                  </div>
                  <div>
                    <h3 className="font-cinzel text-white text-lg">{session.title}</h3>
                    <span className="text-slate-500 text-sm">{session.date}</span>
                  </div>
                </div>

                {/* Events */}
                <div className="ml-5 border-l-2 border-amber-900/30 pl-6 mb-4">
                  <h4 className="text-amber-500 text-xs uppercase tracking-wider mb-2">Eventos</h4>
                  <ul className="space-y-2">
                    {session.events.map((event, i) => (
                      <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="w-2 h-2 bg-amber-500/60 rounded-full mt-1.5 flex-shrink-0" />
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unresolved */}
                <div className="ml-5 border-l-2 border-red-900/30 pl-6">
                  <h4 className="text-red-400 text-xs uppercase tracking-wider mb-2">Questões em Aberto</h4>
                  <ul className="space-y-2">
                    {session.unresolved.map((q, i) => (
                      <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                        <span className="text-red-400">❓</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reference Tab */}
        {activeTab === 'reference' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="font-cinzel text-amber-400 text-xl mb-6">Referência Rápida</h2>
            
            {/* Conditions */}
            <div className="mb-8">
              <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-3">Condições</h3>
              <div className="space-y-2">
                {conditions.map((c) => (
                  <details key={c.name} className="bg-[#0d1f35] border border-amber-900/20 rounded-lg group">
                    <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-amber-900/10 transition-colors">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-white font-medium">{c.name}</span>
                      <Icon icon="game-icons:arrow-scope" className="w-4 h-4 text-slate-500 ml-auto transform group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-4 pb-3 text-slate-400 text-sm border-t border-amber-900/20 pt-3">
                      {c.effect}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Actions in Combat */}
            <div className="mb-8">
              <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-3">Ações em Combate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'Atacar', icon: '⚔️', desc: 'Ataque corpo a corpo ou à distância' },
                  { name: 'Conjurar', icon: '✨', desc: 'Lançar uma magia (pode ter tempo de conjuração)' },
                  { name: 'Correr', icon: '🏃', desc: 'Dobra seu movimento neste turno' },
                  { name: 'Esquivar', icon: '💨', desc: 'Ataques contra você têm desvantagem até seu próximo turno' },
                  { name: 'Desengajar', icon: '🔙', desc: 'Seu movimento não provoca ataques de oportunidade' },
                  { name: 'Ajudar', icon: '🤝', desc: 'Aliado ganha vantagem no próximo teste ou ataque' },
                  { name: 'Esconder', icon: '🫥', desc: 'Teste de Furtividade para se esconder' },
                  { name: 'Preparar', icon: '⏳', desc: 'Prepare uma ação com gatilho específico' },
                ].map((action) => (
                  <div key={action.name} className="bg-[#0d1f35] border border-amber-900/20 rounded-lg px-4 py-3 flex items-center gap-3">
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <span className="text-white font-medium text-sm">{action.name}</span>
                      <p className="text-slate-500 text-xs">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rest Rules */}
            <div>
              <h3 className="text-amber-500 text-sm uppercase tracking-wider mb-3">Descanso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0d1f35] border border-amber-900/20 rounded-lg p-4">
                  <h4 className="text-amber-400 font-cinzel mb-2">☀️ Descanso Curto (1h)</h4>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Gastar Dados de Vida para curar</li>
                    <li>• Recuperar habilidades de descanso curto</li>
                    <li>• Bardo: recupera Inspiração Bárdica</li>
                  </ul>
                </div>
                <div className="bg-[#0d1f35] border border-amber-900/20 rounded-lg p-4">
                  <h4 className="text-amber-400 font-cinzel mb-2">🌙 Descanso Longo (8h)</h4>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Recupera todos os HP</li>
                    <li>• Recupera metade dos Dados de Vida</li>
                    <li>• Recupera todos os espaços de magia</li>
                    <li>• Apenas 1 por 24 horas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="font-cinzel text-amber-400 text-xl mb-2">Notas de Sessão</h2>
            <p className="text-slate-500 text-sm mb-6">Escreva suas anotações durante a sessão. Salvas localmente no navegador.</p>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('chamber-notes', e.target.value)
                }
              }}
              placeholder="Anote o que aconteceu, ideias de RP, perguntas para o DM..."
              className="w-full h-[60vh] bg-[#0d1f35] border border-amber-900/30 rounded-xl p-6 text-slate-300 text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-amber-600/50 resize-none font-crimson text-base"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-slate-600 text-xs">{notes.length} caracteres</span>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('chamber-notes', notes)
                  }
                }}
                className="px-4 py-2 bg-amber-600/20 border border-amber-600/40 rounded-lg text-amber-400 text-sm hover:bg-amber-600/30 transition-colors"
              >
                💾 Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-900/30 py-4 text-center">
        <p className="text-slate-600 text-xs font-crimson italic">
          &ldquo;Um dia lá dentro equivale a um ano lá fora. Use bem o seu tempo.&rdquo; — Mr. Popo
        </p>
      </footer>
    </main>
  )
}
