/**
 * New Session page
 * Easy input options + AI structuring for session logs
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

type InputMode = 'quick' | 'text' | 'manual'

const campaigns = [
  { id: 'campanha-principal', name: 'Campanha Principal' },
  { id: 'campanha-secundaria', name: 'Campanha Secundária' },
]

export default function NewSessionPage() {
  const [inputMode, setInputMode] = useState<InputMode>('quick')
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    summary: string
    keyEvents: string[]
    quotes: string[]
    cliffhanger: string
  } | null>(null)

  // Form state
  const [campaign, setCampaign] = useState('')
  const [sessionNumber, setSessionNumber] = useState<number | ''>('')
  const [playDate, setPlayDate] = useState('')
  
  // Quick mode state
  const [quickWhat, setQuickWhat] = useState('')
  const [quickWho, setQuickWho] = useState('')
  const [quickFound, setQuickFound] = useState('')
  const [quickNext, setQuickNext] = useState('')

  // Text mode state
  const [rawText, setRawText] = useState('')

  // Manual mode state
  const [manualTitle, setManualTitle] = useState('')
  const [manualSummary, setManualSummary] = useState('')

  const handleGenerate = async () => {
    setIsProcessing(true)
    
    // Simulate AI processing (will be replaced with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock generated content
    if (inputMode === 'quick') {
      setGeneratedContent({
        title: 'O Encontro na Taverna',
        summary: `Os aventureiros se reuniram após ${quickWhat || 'uma longa jornada'}. ${quickWho ? `Estavam presentes ${quickWho}.` : ''} A noite foi marcada por revelações importantes e novos desafios à vista.`,
        keyEvents: [
          quickWhat || 'Eventos da sessão',
          quickFound ? `Descobriram: ${quickFound}` : 'Novos itens adquiridos',
        ].filter(Boolean),
        quotes: [],
        cliffhanger: quickNext || 'O que aguarda nossos heróis na próxima sessão?',
      })
    } else if (inputMode === 'text') {
      setGeneratedContent({
        title: 'Sessão Estruturada',
        summary: rawText.slice(0, 500) + (rawText.length > 500 ? '...' : ''),
        keyEvents: ['Evento extraído do texto', 'Outro evento importante'],
        quotes: [],
        cliffhanger: 'Continuará...',
      })
    }
    
    setIsProcessing(false)
  }

  const handleSave = async () => {
    // TODO: Save to Sanity
    alert('Funcionalidade em desenvolvimento! A sessão será salva no Sanity.')
  }

  return (
    <main className="min-h-screen bg-[#e8dcc8]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <Link href="/sessions" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:arrow-scope" className="w-5 h-5 rotate-180" />
            <span>Voltar às Sessões</span>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <Link href="/sessions" className="hover:text-amber-700">Sessões</Link>
          <span>›</span>
          <span className="text-slate-800">Nova Sessão</span>
        </nav>
      </div>

      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="bg-white/80 rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon icon="game-icons:quill-ink" className="w-12 h-12 text-amber-700" />
            <div>
              <h1 className="font-cinzel text-4xl text-slate-800">Registrar Sessão</h1>
              <p className="text-slate-600 font-crimson italic">Escolha como deseja registrar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setInputMode('quick')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'quick'
                ? 'border-amber-500 bg-amber-50'
                : 'border-transparent bg-white/80 hover:border-amber-300'
            }`}
          >
            <Icon icon="game-icons:lightning-helix" className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="font-cinzel text-sm text-slate-800">Rápido</p>
            <p className="text-xs text-slate-500 mt-1">Responda perguntas</p>
          </button>

          <button
            onClick={() => setInputMode('text')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'text'
                ? 'border-amber-500 bg-amber-50'
                : 'border-transparent bg-white/80 hover:border-amber-300'
            }`}
          >
            <Icon icon="game-icons:scroll-unfurled" className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="font-cinzel text-sm text-slate-800">Texto Livre</p>
            <p className="text-xs text-slate-500 mt-1">Cole notas, AI estrutura</p>
          </button>

          <button
            onClick={() => setInputMode('manual')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'manual'
                ? 'border-amber-500 bg-amber-50'
                : 'border-transparent bg-white/80 hover:border-amber-300'
            }`}
          >
            <Icon icon="game-icons:feather" className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="font-cinzel text-sm text-slate-800">Manual</p>
            <p className="text-xs text-slate-500 mt-1">Escreva você mesmo</p>
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="bg-white/80 rounded-lg shadow-lg p-6">
          <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Icon icon="game-icons:info" className="w-5 h-5 text-amber-600" />
            Informações Básicas
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campanha</label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Selecione...</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número da Sessão</label>
              <input
                type="number"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Ex: 42"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Sessão</label>
              <input
                type="date"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input Form based on mode */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="bg-white/80 rounded-lg shadow-lg p-6">
          {inputMode === 'quick' && (
            <>
              <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:lightning-helix" className="w-5 h-5 text-amber-600" />
                Perguntas Rápidas
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Responda brevemente — a AI vai expandir para uma narrativa completa.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    O que aconteceu? <span className="text-slate-400">(resumo rápido)</span>
                  </label>
                  <textarea
                    value={quickWhat}
                    onChange={(e) => setQuickWhat(e.target.value)}
                    placeholder="Ex: O grupo explorou as ruínas, encontrou uma armadilha e lutou contra goblins"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quem estava presente?
                  </label>
                  <input
                    type="text"
                    value={quickWho}
                    onChange={(e) => setQuickWho(e.target.value)}
                    placeholder="Ex: Idris, Aria, Theron"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    O que descobriram/encontraram?
                  </label>
                  <input
                    type="text"
                    value={quickFound}
                    onChange={(e) => setQuickFound(e.target.value)}
                    placeholder="Ex: Um mapa antigo e uma espada mágica"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    O que ficou para a próxima sessão?
                  </label>
                  <input
                    type="text"
                    value={quickNext}
                    onChange={(e) => setQuickNext(e.target.value)}
                    placeholder="Ex: Precisam decidir se seguem o mapa ou voltam à cidade"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          {inputMode === 'text' && (
            <>
              <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:scroll-unfurled" className="w-5 h-5 text-amber-600" />
                Texto Livre
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Cole suas anotações, chat logs, ou qualquer texto. A AI vai estruturar em um log bonito.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Cole aqui suas anotações da sessão..."
                rows={10}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-sm"
              />
            </>
          )}

          {inputMode === 'manual' && (
            <>
              <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:feather" className="w-5 h-5 text-amber-600" />
                Escrita Manual
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Escreva o log da sessão do seu jeito.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título da Sessão</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ex: A Queda de Solaria"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resumo da Sessão</label>
                  <textarea
                    value={manualSummary}
                    onChange={(e) => setManualSummary(e.target.value)}
                    placeholder="Descreva o que aconteceu na sessão..."
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Generate / Process Button */}
          {inputMode !== 'manual' && (
            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Icon icon="game-icons:spinning-blades" className="w-5 h-5 animate-spin" />
                    <span>A AI está processando...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="game-icons:magic-swirl" className="w-5 h-5" />
                    <span>Gerar Log com AI</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generated Preview */}
      {generatedContent && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <div className="bg-white/80 rounded-lg shadow-lg p-6 border-2 border-amber-400">
            <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Icon icon="game-icons:crystal-ball" className="w-5 h-5 text-amber-600" />
              Preview do Log Gerado
            </h2>

            <div className="bg-[#faf8f5] rounded-lg p-6 border border-amber-200">
              <h3 className="font-cinzel text-2xl text-slate-800 mb-2">
                {generatedContent.title}
              </h3>
              <p className="text-slate-700 font-crimson text-lg mb-4">
                {generatedContent.summary}
              </p>

              {generatedContent.keyEvents.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-cinzel text-sm text-slate-600 mb-2">Eventos Principais</h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {generatedContent.keyEvents.map((event, i) => (
                      <li key={i} className="font-crimson">{event}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedContent.cliffhanger && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-sm text-amber-800 font-crimson italic">
                    🎯 Próxima sessão: {generatedContent.cliffhanger}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Icon icon="game-icons:check-mark" className="w-5 h-5" />
                <span>Salvar Sessão</span>
              </button>
              <button
                onClick={() => setGeneratedContent(null)}
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg transition-colors"
              >
                <Icon icon="game-icons:return-arrow" className="w-5 h-5" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Save */}
      {inputMode === 'manual' && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Icon icon="game-icons:check-mark" className="w-5 h-5" />
            <span>Salvar Sessão</span>
          </button>
        </div>
      )}

      {/* Coming Soon: Audio */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="bg-slate-100/80 rounded-lg p-4 border border-slate-300 border-dashed">
          <div className="flex items-center gap-3 text-slate-500">
            <Icon icon="game-icons:audio-cassette" className="w-6 h-6" />
            <div>
              <p className="font-medium">Em breve: Upload de Áudio</p>
              <p className="text-sm">Envie gravações da sessão — transcrevemos e estruturamos automaticamente!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-amber-400/60 font-crimson italic">
            "Cada sessão é um capítulo. Cada decisão, uma linha na história de Átrias."
          </p>
          <p className="text-slate-500 text-sm mt-4">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
