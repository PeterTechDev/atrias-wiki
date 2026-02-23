/**
 * New Session page
 * Easy input options + AI structuring for session logs
 */

'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

type InputMode = 'quick' | 'text' | 'audio' | 'manual'

function FeatherIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  )
}

type MatchedEntity = {
  id: string
  name: string
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster' | 'session'
  slug: string
}

type GeneratedContent = {
  title: string
  summary: string
  keyEvents: string[]
  quotes: string[]
  cliffhanger: string
  transcript?: string
  matchedEntities: MatchedEntity[]
}

const campaigns = [
  { id: 'campanha-principal', name: 'Campanha Principal' },
  { id: 'campanha-secundaria', name: 'Campanha Secundária' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export default function NewSessionPage() {
  const router = useRouter()

  const [inputMode, setInputMode] = useState<InputMode>('quick')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

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

  // Audio mode state
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Manual mode state
  const [manualTitle, setManualTitle] = useState('')
  const [manualSummary, setManualSummary] = useState('')

  const audioMeta = useMemo(() => {
    if (!audioFile) return null
    return { name: audioFile.name, size: formatBytes(audioFile.size) }
  }, [audioFile])

  const validateAudio = (file: File): string | null => {
    const maxBytes = 25 * 1024 * 1024
    if (file.size > maxBytes) return 'Arquivo muito grande (máx. 25MB).'

    const name = file.name.toLowerCase()
    const okExt = name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav') || name.endsWith('.ogg')
    if (!okExt) return 'Formato não suportado. Use .mp3, .m4a, .wav, ou .ogg.'

    return null
  }

  const onPickAudio = (file: File | null) => {
    setError(null)
    setGeneratedContent(null)

    if (!file) {
      setAudioFile(null)
      return
    }

    const err = validateAudio(file)
    if (err) {
      setAudioFile(null)
      setError(err)
      return
    }

    setAudioFile(file)
  }

  const handleGenerate = async () => {
    setError(null)
    setGeneratedContent(null)

    if (!campaign) {
      setError('Selecione uma campanha.')
      return
    }
    if (!sessionNumber) {
      setError('Informe o número da sessão.')
      return
    }
    if (!playDate) {
      setError('Informe a data da sessão.')
      return
    }

    if (inputMode === 'text' && !rawText.trim()) {
      setError('Cole algum texto para a AI estruturar.')
      return
    }

    if (inputMode === 'audio' && !audioFile) {
      setError('Selecione um arquivo de áudio.')
      return
    }

    if (inputMode === 'quick') {
      const hasAny = [quickWhat, quickWho, quickFound, quickNext].some((s) => s.trim().length > 0)
      if (!hasAny) {
        setError('Preencha pelo menos um dos campos do modo rápido.')
        return
      }
    }

    setIsProcessing(true)

    try {
      const form = new FormData()
      form.set('mode', inputMode)
      form.set('campaign', campaign)
      form.set('sessionNumber', String(sessionNumber))
      form.set('playDate', playDate)

      if (inputMode === 'audio' && audioFile) {
        form.set('audio', audioFile)
      }

      if (inputMode === 'text') {
        form.set('rawText', rawText)
      }

      if (inputMode === 'quick') {
        form.set('quickWhat', quickWhat)
        form.set('quickWho', quickWho)
        form.set('quickFound', quickFound)
        form.set('quickNext', quickNext)
      }

      const res = await fetch('/api/sessions/process', {
        method: 'POST',
        body: form,
      })

      const json: unknown = await res.json()
      if (!res.ok) {
        const msg = (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string')
          ? json.error
          : 'Falha ao processar.'
        throw new Error(msg)
      }

      if (!json || typeof json !== 'object') throw new Error('Resposta inválida da API.')
      const data = json as Partial<GeneratedContent>

      const title = typeof data.title === 'string' ? data.title : ''
      const summary = typeof data.summary === 'string' ? data.summary : ''
      const keyEvents = Array.isArray(data.keyEvents) ? data.keyEvents.filter((x): x is string => typeof x === 'string') : []
      const quotes = Array.isArray(data.quotes) ? data.quotes.filter((x): x is string => typeof x === 'string') : []
      const cliffhanger = typeof data.cliffhanger === 'string' ? data.cliffhanger : ''
      const transcript = typeof data.transcript === 'string' ? data.transcript : undefined

      const matchedEntities = Array.isArray(data.matchedEntities)
        ? data.matchedEntities.filter((m): m is MatchedEntity => {
            if (!m || typeof m !== 'object') return false
            const mm = m as Partial<MatchedEntity>
            return Boolean(
              typeof mm.id === 'string' &&
                typeof mm.name === 'string' &&
                typeof mm.slug === 'string' &&
                typeof mm.type === 'string'
            )
          })
        : []

      if (!title || !summary) throw new Error('A AI não retornou título/resumo válidos.')

      setGeneratedContent({ title, summary, keyEvents, quotes, cliffhanger, transcript, matchedEntities })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    setError(null)

    // Manual mode saves without AI.
    if (inputMode === 'manual') {
      if (!campaign) return setError('Selecione uma campanha.')
      if (!sessionNumber) return setError('Informe o número da sessão.')
      if (!playDate) return setError('Informe a data da sessão.')
      if (!manualTitle.trim()) return setError('Informe um título.')
      if (!manualSummary.trim()) return setError('Informe um resumo.')

      try {
        const res = await fetch('/api/sessions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign,
            sessionNumber: Number(sessionNumber),
            playDate,
            title: manualTitle.trim(),
            summary: manualSummary.trim(),
            keyEvents: [],
            quotes: [],
            cliffhanger: '',
            matchedEntities: [],
          }),
        })

        const json: unknown = await res.json()
        if (!res.ok) {
          const msg = (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string')
            ? json.error
            : 'Falha ao salvar.'
          throw new Error(msg)
        }

        const slug = (json && typeof json === 'object' && 'slug' in json && typeof json.slug === 'string') ? json.slug : null
        if (!slug) throw new Error('Resposta inválida ao salvar.')
        router.push(`/sessions/${campaign}/${slug}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido')
      }

      return
    }

    if (!generatedContent) {
      setError('Gere o log com AI antes de salvar.')
      return
    }

    try {
      const res = await fetch('/api/sessions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          sessionNumber: typeof sessionNumber === 'number' ? sessionNumber : Number(sessionNumber),
          playDate,
          title: generatedContent.title,
          summary: generatedContent.summary,
          keyEvents: generatedContent.keyEvents,
          quotes: generatedContent.quotes,
          cliffhanger: generatedContent.cliffhanger,
          transcript: generatedContent.transcript,
          matchedEntities: generatedContent.matchedEntities,
        }),
      })

      const json: unknown = await res.json()
      if (!res.ok) {
        const msg = (json && typeof json === 'object' && 'error' in json && typeof json.error === 'string')
          ? json.error
          : 'Falha ao salvar.'
        throw new Error(msg)
      }

      const slug = (json && typeof json === 'object' && 'slug' in json && typeof json.slug === 'string') ? json.slug : null
      if (!slug) throw new Error('Resposta inválida ao salvar.')

      router.push(`/sessions/${campaign}/${slug}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    }
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
            onClick={() => setInputMode('audio')}
            className={`p-4 rounded-lg border-2 transition-all ${
              inputMode === 'audio'
                ? 'border-amber-500 bg-amber-50'
                : 'border-transparent bg-white/80 hover:border-amber-300'
            }`}
          >
            <Icon icon="game-icons:audio-cassette" className="w-8 h-8 mx-auto mb-2 text-amber-600" />
            <p className="font-cinzel text-sm text-slate-800">Áudio</p>
            <p className="text-xs text-slate-500 mt-1">Upload → transcrição</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campanha <span className="text-red-500">*</span></label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${campaign ? 'text-slate-700' : 'text-stone-500'}`}
              >
                <option value="">Selecione...</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número da Sessão <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={sessionNumber}
                onChange={(e) => setSessionNumber(e.target.value ? Number.parseInt(e.target.value, 10) : '')}
                placeholder="Ex: 42"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Sessão <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">* Campos obrigatórios</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quem estava presente?</label>
                  <input
                    type="text"
                    value={quickWho}
                    onChange={(e) => setQuickWho(e.target.value)}
                    placeholder="Ex: Idris, Aria, Theron"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">O que descobriram/encontraram?</label>
                  <input
                    type="text"
                    value={quickFound}
                    onChange={(e) => setQuickFound(e.target.value)}
                    placeholder="Ex: Um mapa antigo e uma espada mágica"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">O que ficou para a próxima sessão?</label>
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

          {inputMode === 'audio' && (
            <>
              <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:audio-cassette" className="w-5 h-5 text-amber-600" />
                Upload de Áudio
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Arraste um arquivo aqui (ou clique para selecionar). Máximo 25MB.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.m4a,.wav,.ogg,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null
                  onPickAudio(file)
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files && e.dataTransfer.files.length > 0 ? e.dataTransfer.files[0] : null
                  onPickAudio(file)
                }}
                className="cursor-pointer bg-[#faf8f5] rounded-lg p-6 border-2 border-dashed border-amber-300 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Icon icon="game-icons:cloud-upload" className="w-7 h-7 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">Clique para enviar ou arraste e solte</p>
                    <p className="text-slate-600 text-sm">.mp3 • .m4a • .wav • .ogg</p>
                  </div>
                  {audioFile ? (
                    <Icon icon="game-icons:check-mark" className="w-6 h-6 text-green-700" />
                  ) : (
                    <Icon icon="game-icons:cursor" className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                {audioMeta && (
                  <div className="mt-4 p-3 bg-white/70 rounded-lg border border-amber-200 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-slate-800 text-sm font-medium truncate">{audioMeta.name}</p>
                      <p className="text-slate-600 text-xs">{audioMeta.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setAudioFile(null)
                      }}
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm"
                    >
                      <Icon icon="game-icons:trash-can" className="w-4 h-4" />
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {inputMode === 'manual' && (
            <>
              <h2 className="font-cinzel text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Icon icon="game-icons:feather" className="w-5 h-5 text-amber-600" />
                Escrita Manual
              </h2>
              <p className="text-sm text-slate-600 mb-4">Escreva o log da sessão do seu jeito.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título da Sessão <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ex: A Queda de Solaria"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resumo da Sessão <span className="text-red-500">*</span></label>
                  <textarea
                    value={manualSummary}
                    onChange={(e) => setManualSummary(e.target.value)}
                    placeholder="Descreva o que aconteceu na sessão..."
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">* Campos obrigatórios</p>
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
                    <span className="whitespace-pre-line">
                      {'Thaveus desperta de seu bolsão extradimensional...\nA Pena começa a se mover.'}
                    </span>
                  </>
                ) : (
                  <>
                    <FeatherIcon className="w-5 h-5" />
                    <span>Despertar a Pena</span>
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
              <h3 className="font-cinzel text-2xl text-slate-800 mb-2 quill-reveal quill-reveal-1">
                {generatedContent.title}
              </h3>

              <div className="mb-4 quill-reveal quill-reveal-2">
                {generatedContent.summary
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, i) => (
                    <p
                      key={i}
                      className="text-slate-700 font-crimson text-lg mb-3 quill-reveal"
                      style={{ animationDelay: `${0.2 + i * 0.12}s`, opacity: 0 }}
                    >
                      {p}
                    </p>
                  ))}
              </div>

              {generatedContent.keyEvents.length > 0 && (
                <div className="mb-4 quill-reveal quill-reveal-3">
                  <h4 className="font-cinzel text-sm text-slate-600 mb-2">Eventos Principais</h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {generatedContent.keyEvents.map((event, i) => (
                      <li
                        key={i}
                        className="font-crimson quill-reveal"
                        style={{ animationDelay: `${0.25 + i * 0.1}s`, opacity: 0 }}
                      >
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedContent.quotes.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-cinzel text-sm text-slate-600 mb-2">Citações Memoráveis</h4>
                  <ul className="list-disc list-inside text-slate-700 space-y-1">
                    {generatedContent.quotes.map((q, i) => (
                      <li key={i} className="font-crimson italic">{`"${q}"`}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedContent.cliffhanger && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400 quill-reveal quill-reveal-4">
                  <p className="text-sm text-amber-800 font-crimson italic">
                    Próxima sessão: {generatedContent.cliffhanger}
                  </p>
                </div>
              )}

              {generatedContent.matchedEntities.length > 0 && (
                <div className="mt-4 quill-reveal quill-reveal-5">
                  <h4 className="font-cinzel text-sm text-slate-600 mb-2">Entidades detectadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.matchedEntities.map((m, i) => (
                      <span
                        key={m.id}
                        className="text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-1 rounded-full quill-reveal"
                        style={{ animationDelay: `${0.3 + i * 0.06}s`, opacity: 0 }}
                        title={`${m.type} • ${m.slug}`}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
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
