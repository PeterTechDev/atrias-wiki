'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { DICE_STORAGE_KEY, DIE_SIDES, FAVORITES_LIMIT, HISTORY_LIMIT, MAX_DICE, diceCount, motionStrength, notation, parseNotation, readDiceStorage, type DiceCombination, type DicePool, type DiceRoll, type DieSides } from '@/lib/dice'
import type { createDiceScene, DiceTheme, TableTheme } from './diceScene'

const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbbd9f] px-3 py-2 text-sm font-medium transition-colors hover:border-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700'
const panel = 'rounded-xl border border-[#d9cdb7] bg-[#faf7ef] p-4 shadow-sm'
const field = 'w-full min-h-11 rounded-lg border border-[#cbbd9f] bg-white/80 px-3 py-2 text-sm text-slate-800 outline-offset-2 focus:outline-amber-700'
const icons: Record<DieSides, string> = { 4: 'game-icons:d4', 6: 'game-icons:perspective-dice-six-faces-random', 8: 'game-icons:dice-eight-faces-eight', 10: 'game-icons:d10', 12: 'game-icons:d12', 20: 'game-icons:dice-twenty-faces-twenty' }
const presets = [{ name: 'Ataque', expression: '1d20 + 5' }, { name: 'Bola de fogo', expression: '8d6' }, { name: 'Cura', expression: '2d8 + 3' }]

export default function DiceRoller() {
  const host = useRef<HTMLDivElement>(null)
  const engine = useRef<ReturnType<typeof createDiceScene> | null>(null)
  const mounted = useRef(false)
  const rolling = useRef(false)
  const cooldown = useRef(0)
  const ledger = useRef<ReturnType<typeof readDiceStorage>>({ history: [], favorites: [] })
  const storageReadable = useRef(true)
  const [saved, setSaved] = useState<ReturnType<typeof readDiceStorage>>({ history: [], favorites: [] })
  const [storageReady, setStorageReady] = useState(false)
  const [ready, setReady] = useState(false)
  const [engineError, setEngineError] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [notice, setNotice] = useState('')
  const [pool, setPool] = useState<DicePool>({ 20: 1 })
  const [modifier, setModifier] = useState('0')
  const [expression, setExpression] = useState('')
  const [favoriteName, setFavoriteName] = useState('')
  const [theme, setTheme] = useState<DiceTheme>('white-flame')
  const [table, setTable] = useState<TableTheme>('sanctuary')
  const [force, setForce] = useState(2)
  const [sound, setSound] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<DiceRoll | null>(null)
  const [tab, setTab] = useState<'history' | 'favorites'>('history')
  const [motion, setMotion] = useState(false)
  const [motionPending, setMotionPending] = useState(false)
  const [motionMessage, setMotionMessage] = useState('')
  const [sensitivity, setSensitivity] = useState(16)
  const count = diceCount(pool)
  const modifierValid = /^-?\d+$/.test(modifier) && Math.abs(Number(modifier)) <= 999
  const combination = { pool, modifier: Number(modifier) || 0 }

  useEffect(() => {
    mounted.current = true
    let cancelled = false
    void import('./diceScene').then(({ createDiceScene }) => {
      if (cancelled || !host.current) return
      engine.current = createDiceScene(host.current, message => { setEngineError(message); setReady(false) })
      setReady(true)
    }).catch(() => { if (!cancelled) setEngineError('Não foi possível abrir a mesa 3D. Verifique se a aceleração gráfica está habilitada e recarregue a página.') })
    queueMicrotask(() => {
      if (cancelled) return
      try { ledger.current = readDiceStorage(localStorage.getItem(DICE_STORAGE_KEY)); setSaved(ledger.current) }
      catch { storageReadable.current = false; setStorageError('Não foi possível ler os dados salvos. Seus registros anteriores serão preservados; novas jogadas ficam apenas nesta sessão.') }
      setStorageReady(true)
    })
    return () => { cancelled = true; mounted.current = false; engine.current?.dispose(); engine.current = null }
  }, [])

  useEffect(() => { if (ready) engine.current?.customize(theme, table, pool) }, [ready, theme, table, pool])

  function persist(next: typeof saved) {
    ledger.current = next; setSaved(next)
    if (!storageReadable.current) return
    try { localStorage.setItem(DICE_STORAGE_KEY, JSON.stringify(next)); setStorageError('') }
    catch { setStorageError('Armazenamento indisponível ou cheio. Seus dados ficam apenas nesta sessão enquanto esta página estiver aberta.') }
  }

  function changePool(sides: DieSides, delta: number) {
    if (busy) return
    setPool(current => ({ ...current, [sides]: Math.max(0, Math.min(current[sides] ?? 0, MAX_DICE) + (delta > 0 && diceCount(current) >= MAX_DICE ? 0 : delta)) }))
    setResult(null); setNotice('')
  }

  function prepare(next: DiceCombination) {
    if (busy) return
    setPool({ ...next.pool }); setModifier(String(next.modifier)); setResult(null); setError(''); setNotice('Combinação preparada. Role quando estiver pronto.')
  }

  function applyExpression() {
    try { prepare(parseNotation(expression)); setExpression('') }
    catch (error) { setError(error instanceof Error ? error.message : 'Combinação inválida.') }
  }

  async function roll() {
    if (rolling.current || !engine.current || !ready || !count || !modifierValid) return
    rolling.current = true; setBusy(true); setError(''); setNotice(''); setResult(null)
    host.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
    const snapshot = { pool: { ...pool }, modifier: Number(modifier) }
    try {
      const dice = await engine.current.roll(snapshot.pool, force)
      if (!mounted.current) return
      const next = { ...snapshot, id: crypto.randomUUID(), at: new Date().toISOString(), dice, total: dice.reduce((sum, die) => sum + die.value, snapshot.modifier) }
      setResult(next)
      persist({ ...ledger.current, history: [next, ...ledger.current.history].slice(0, HISTORY_LIMIT) })
      if (motion) navigator.vibrate?.(35)
    } catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Não foi possível rolar. Tente novamente.') }
    finally { rolling.current = false; cooldown.current = performance.now() + 1500; if (mounted.current) setBusy(false) }
  }

  const rollFromEvent = useEffectEvent(() => { void roll() })
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.code === 'Space' && !event.repeat && event.target === document.body) { event.preventDefault(); rollFromEvent() }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])

  useEffect(() => {
    if (!motion) return
    let received = false, peak = 0
    const started = performance.now()
    function onMotion(event: DeviceMotionEvent) {
      const hasData = [event.acceleration?.x, event.acceleration?.y, event.acceleration?.z, event.accelerationIncludingGravity?.x, event.accelerationIncludingGravity?.y, event.accelerationIncludingGravity?.z].some(value => typeof value === 'number' && Number.isFinite(value))
      if (hasData && !received) { received = true; setMotionMessage('Sensor pronto. Faça um gesto de arremesso segurando o celular.') }
      if (!hasData || document.hidden || rolling.current || performance.now() < cooldown.current || performance.now() - started < 1200) { peak = 0; return }
      const strength = motionStrength(event)
      if (strength >= sensitivity) peak = performance.now()
      if (peak && strength < sensitivity * 0.45 && performance.now() - peak < 800) {
        peak = 0; cooldown.current = performance.now() + 2500; rollFromEvent()
      }
    }
    const timeout = window.setTimeout(() => { if (!received) { setMotion(false); setMotionMessage('Nenhum sinal do sensor. Confira a permissão de movimento ou use o botão de rolar.') } }, 8000)
    window.addEventListener('devicemotion', onMotion)
    return () => { window.clearTimeout(timeout); window.removeEventListener('devicemotion', onMotion) }
  }, [motion, sensitivity])

  async function enableMotion() {
    if (motion) { setMotion(false); setMotionMessage('Movimento desativado.'); return }
    if (!window.isSecureContext || typeof DeviceMotionEvent === 'undefined') { setMotionMessage('Este navegador não oferece o sensor de movimento. No celular, abra a página por HTTPS.'); return }
    setMotionPending(true)
    try {
      const api = DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> }
      if (api.requestPermission && await api.requestPermission() !== 'granted') { setMotionMessage('Permissão de movimento negada. Você pode continuar usando o botão.'); return }
      setMotion(true); setMotionMessage('Aguardando o sensor…')
    } catch { setMotionMessage('Não foi possível ativar o sensor. Use o botão de rolar.') }
    finally { setMotionPending(false) }
  }

  function saveFavorite() {
    if (!count || !modifierValid || !storageReady) return
    if (saved.favorites.length >= FAVORITES_LIMIT) { setError(`Você pode salvar até ${FAVORITES_LIMIT} favoritos. Remova um para adicionar outro.`); return }
    if (saved.favorites.some(item => notation(item) === notation(combination))) { setNotice('Essa combinação já está nos seus favoritos.'); setTab('favorites'); return }
    const name = favoriteName.trim() || notation(combination)
    persist({ ...ledger.current, favorites: [...ledger.current.favorites, { ...combination, pool: { ...pool }, id: crypto.randomUUID(), name }] })
    setFavoriteName(''); setNotice('Combinação adicionada aos favoritos.'); setTab('favorites')
  }

  const critical = result?.dice.some(die => die.sides === 20 && die.value === 20)
  const fumble = result?.dice.some(die => die.sides === 20 && die.value === 1)

  return <main className="min-h-screen bg-[#eee6d6] text-[#243247] [font-family:var(--font-geist)]">
    <header className="border-b border-amber-200/15 bg-[#0a1628] px-4 py-4 text-amber-100 sm:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-cinzel flex items-center gap-2 text-lg tracking-wider text-[#c6a862]"><Icon icon="game-icons:book-cover" width={24} /> WIKI ÁTRIAS</Link>
        <Link href="/browse" className="inline-flex min-h-11 items-center gap-2 text-sm text-amber-100/80 hover:text-white"><Icon icon="mdi:arrow-left" /> Voltar aos arquivos</Link>
      </div>
    </header>
    <div className="mx-auto max-w-[1600px] px-3 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#90713b]">À mesa, aventureiro</p><h1 className="font-cinzel text-3xl sm:text-4xl">Mesa de Dados</h1><p className="font-crimson mt-2 text-lg text-slate-600">Prepare a jogada. Respire fundo. Deixe o destino rolar.</p></div>
        <span className="flex items-center gap-2 rounded-full border border-[#d9cdb7] bg-[#faf7ef] px-4 py-2 text-xs text-slate-600"><Icon icon="mdi:shield-sun-outline" width={18} className="text-amber-700" /> Forjados para suas aventuras</span>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px]">
        <aside className="space-y-4" aria-label="Preparar rolagem">
          <section className={panel}>
            <div className="mb-4 flex items-center justify-between"><h2 className="font-cinzel text-base">Seus dados</h2><span className="text-xs text-slate-500">{count}/{MAX_DICE}</span></div>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {DIE_SIDES.map(sides => <div key={sides} className={`overflow-hidden rounded-lg border ${pool[sides] ? 'border-[#ad8c4d] bg-[#eee5d0]' : 'border-[#ded5c3] bg-white/50'}`}>
                <button type="button" aria-label={`Adicionar d${sides}`} disabled={busy || count >= MAX_DICE} onClick={() => changePool(sides, 1)} className="flex min-h-20 w-full flex-col items-center justify-center gap-1 text-[#745725] hover:bg-amber-100/60 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-amber-700"><Icon icon={icons[sides]} width={34} height={34} /><span className="text-sm font-semibold">d{sides}</span></button>
                <div className="flex items-center justify-between border-t border-[#d9cdb7]"><button className="min-h-11 min-w-9 text-lg disabled:opacity-25" aria-label={`Remover d${sides}`} disabled={busy || !pool[sides]} onClick={() => changePool(sides, -1)}>−</button><span className="text-sm font-semibold" aria-label={`${pool[sides] ?? 0} dados d${sides}`}>{pool[sides] ?? 0}</span><button className="min-h-11 min-w-9 text-lg disabled:opacity-25" aria-label={`Mais um d${sides}`} disabled={busy || count >= MAX_DICE} onClick={() => changePool(sides, 1)}>+</button></div>
              </div>)}
            </div>
            <div className="mt-4 flex items-center gap-3"><label htmlFor="modifier" className="flex-1 text-sm">Modificador</label><input id="modifier" type="number" min={-999} max={999} step={1} value={modifier} disabled={busy} aria-invalid={!modifierValid} onChange={event => { setModifier(event.target.value); setResult(null) }} className={`${field} max-w-24 text-center`} /></div>
            {!modifierValid && <p className="mt-2 text-xs text-red-800">Use um inteiro entre −999 e +999.</p>}
            <button className="mt-2 min-h-11 text-xs text-slate-600 underline underline-offset-4 disabled:opacity-40" disabled={busy || !count} onClick={() => { setPool({}); setModifier('0'); setResult(null) }}>Limpar seleção</button>
            <form className="mt-3 border-t border-[#ded5c3] pt-4" onSubmit={event => { event.preventDefault(); applyExpression() }}><label htmlFor="dice-expression" className="mb-2 block text-xs font-semibold">Ou escreva sua combinação</label><input id="dice-expression" className={field} placeholder="2d6 + 4d8 + 3" value={expression} maxLength={200} disabled={busy} onChange={event => setExpression(event.target.value)} /><button className={`${button} mt-2 w-full`} disabled={busy || !expression.trim()}>Preparar combinação</button></form>
          </section>
          <section className={panel}><h2 className="font-cinzel mb-3 text-sm">Jogadas rápidas</h2><div className="flex flex-wrap gap-2">{presets.map(preset => <button key={preset.name} disabled={busy} className={`${button} flex-1 flex-col gap-0 px-2 text-xs`} onClick={() => prepare(parseNotation(preset.expression))}>{preset.name}<span className="text-[11px] font-normal text-slate-500">{preset.expression}</span></button>)}</div></section>
        </aside>

        <section className="min-w-0 space-y-4" aria-label="Mesa de rolagem" aria-busy={busy}>
          <div className="overflow-hidden rounded-xl border border-[#c9b891] bg-[#0f2035] shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#b99853]/30 px-4 py-3 text-[#dbc799]"><span className="flex items-center gap-2 text-xs uppercase tracking-[0.13em]"><Icon icon={table === 'sanctuary' ? 'mdi:shield-sun-outline' : 'game-icons:wooden-sign'} width={19} />{table === 'sanctuary' ? 'Santuário da Chama Branca' : 'Mesa da taverna'}</span><span className="text-[11px] text-slate-300">{busy ? 'O destino está em movimento…' : 'Sua próxima história começa aqui'}</span></div>
            <div className="relative h-[350px] sm:h-[440px] lg:h-[460px] 2xl:h-[540px]">
              <div ref={host} className="absolute inset-0 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full" />
              {!ready && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center text-amber-100"><Icon icon="game-icons:dice-twenty-faces-twenty" width={48} className={engineError ? '' : 'animate-pulse motion-reduce:animate-none'} /><p role={engineError ? 'alert' : 'status'}>{engineError || 'Preparando sua mesa…'}</p>{engineError && <button className={`${button} text-amber-100 hover:text-slate-900`} onClick={() => window.location.reload()}>Recarregar mesa</button>}</div>}
              {ready && !count && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><p className="rounded-lg bg-[#faf7ef]/90 px-5 py-3 text-sm text-slate-700">Escolha seus dados para começar.</p></div>}
              {ready && !busy && count > 0 && !result && <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0a1628]/80 px-3 py-1.5 text-[11px] text-amber-50">Dados preparados · aguardando seu lançamento</span>}
            </div>
            <div aria-live="polite" aria-atomic="true" className="flex min-h-28 items-center justify-between gap-4 border-t border-[#b99853]/30 px-5 py-4 text-amber-50">
              <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.2em] text-[#c6a862]">{busy ? 'Que a sorte acompanhe você' : result ? critical ? '20 natural · a chama brilha!' : fumble ? '1 natural · até heróis tropeçam' : 'O destino respondeu' : 'Sua combinação'}</p><p className="mt-2 break-words text-lg font-semibold">{busy ? 'Rolando…' : notation(result || combination)}</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{result ? `${result.dice.map(die => `d${die.sides}: ${die.value}`).join(' · ')}${result.modifier ? ` · modificador: ${result.modifier > 0 ? '+' : ''}${result.modifier}` : ''}` : busy ? 'O resultado será revelado quando os dados pararem.' : 'O resultado aparece depois do lançamento.'}</p></div>
              <div className="shrink-0 text-center"><span className="text-[10px] uppercase tracking-widest text-[#c6a862]">Total</span><p className={`font-cinzel mt-1 text-5xl ${critical ? 'text-amber-300' : 'text-[#f5e8c8]'}`}>{result ? result.total : '—'}</p></div>
            </div>
          </div>

          <div className={`${panel} space-y-4`}>
            <div className="flex items-center gap-4"><Icon icon="game-icons:strong" width={24} className="shrink-0 text-[#947339]" /><label htmlFor="roll-force" className="shrink-0 text-sm">Força <span className="block text-xs text-slate-500">{['', 'Suave', 'Firme', 'Épica'][force]}</span></label><input id="roll-force" type="range" min={1} max={3} step={1} value={force} disabled={busy} onChange={event => setForce(Number(event.target.value))} className="min-h-11 w-full accent-[#947339]" aria-valuetext={['', 'Suave', 'Firme', 'Épica'][force]} /><Icon icon="game-icons:comet-spark" width={24} className="shrink-0 text-[#947339]" /></div>
            <button onClick={() => void roll()} disabled={!ready || busy || !count || !modifierValid || !storageReady} className="flex min-h-18 w-full items-center justify-center gap-3 rounded-lg border border-[#d7bf7f] bg-gradient-to-b from-[#bda262] to-[#9c7c3e] px-5 py-4 font-semibold text-[#111e2f] shadow-md transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"><Icon icon="game-icons:rolling-dices" width={30} className={busy ? 'animate-pulse motion-reduce:animate-none' : ''} /><span className="font-cinzel text-lg">{busy ? 'O destino está rolando…' : result ? 'Rolar novamente' : 'Rolar os dados'}</span></button>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>Um toque. Infinitas possibilidades.</span><span className="hidden sm:inline">Atalho: barra de espaço</span></div>
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="text-sm text-[#6a542e]">{notice}</p>}

          <section className={panel} aria-label="Personalizar a experiência">
            <h2 className="font-cinzel mb-4 text-base">Dê seu toque à mesa</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset disabled={busy}><legend className="mb-2 text-xs font-semibold text-slate-600">Textura dos dados</legend><div className="grid grid-cols-2 gap-2">{([{ id: 'white-flame', name: 'Chama Branca', swatch: 'bg-[repeating-linear-gradient(35deg,#f6f0df,#f6f0df_5px,#c4b58c_6px,#f6f0df_8px)]' }, { id: 'obsidian', name: 'Obsidiana', swatch: 'bg-[repeating-linear-gradient(135deg,#202c47,#202c47_4px,#677c9b_5px,#202c47_8px)]' }] as const).map(item => <button key={item.id} aria-pressed={theme === item.id} onClick={() => { setTheme(item.id); setResult(null) }} className={`${button} flex-col px-1 ${theme === item.id ? 'border-amber-700 bg-[#eee5d0]' : ''}`}><span className={`h-7 w-7 rounded-lg border border-[#ad8c4d] ${item.swatch}`} /><span className="text-xs">{item.name}</span></button>)}</div></fieldset>
              <fieldset disabled={busy}><legend className="mb-2 text-xs font-semibold text-slate-600">Superfície da mesa</legend><div className="grid grid-cols-2 gap-2">{([{ id: 'sanctuary', name: 'Santuário', swatch: 'bg-[#e9dfc9]' }, { id: 'tavern', name: 'Taverna', swatch: 'bg-[repeating-linear-gradient(0deg,#523526,#523526_5px,#35251a_6px)]' }] as const).map(item => <button key={item.id} aria-pressed={table === item.id} onClick={() => { setTable(item.id); setResult(null) }} className={`${button} flex-col px-1 ${table === item.id ? 'border-amber-700 bg-[#eee5d0]' : ''}`}><span className={`h-7 w-12 rounded border border-[#ad8c4d] ${item.swatch}`} /><span className="text-xs">{item.name}</span></button>)}</div></fieldset>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#ded5c3] pt-4"><button className={button} aria-pressed={sound} disabled={!ready} onClick={() => { try { engine.current?.setSound(!sound); setSound(!sound) } catch { setError('Áudio indisponível neste navegador.') } }}><Icon icon={sound ? 'mdi:volume-high' : 'mdi:volume-off'} width={18} /> Som {sound ? 'ligado' : 'desligado'}</button><button className={button} aria-pressed={motion} disabled={!ready || motionPending} onClick={() => void enableMotion()}><Icon icon="mdi:cellphone-wireless" width={18} />{motionPending ? 'Ativando…' : motion ? 'Desativar gesto' : 'Rolar com movimento'}</button></div>
            {motionMessage && <p role="status" className="mt-3 text-xs leading-relaxed text-slate-600">{motionMessage}</p>}
            {motion && <div className="mt-3"><label htmlFor="motion-sensitivity" className="text-xs text-slate-600">Sensibilidade do gesto · {sensitivity <= 12 ? 'alta' : sensitivity >= 22 ? 'baixa' : 'média'}</label><input id="motion-sensitivity" type="range" min={8} max={28} step={2} value={sensitivity} onChange={event => setSensitivity(Number(event.target.value))} className="block min-h-11 w-full accent-[#947339]" /><p className="text-xs text-slate-500">Segure o celular com firmeza; o gesto não precisa ser brusco.</p></div>}
          </section>
        </section>

        <aside className={`${panel} lg:col-span-2 xl:col-span-1`} aria-label="Histórico e favoritos">
          <div className="mb-4 flex border-b border-[#ded5c3]" role="tablist" aria-label="Registros da mesa" onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const next = event.key === 'Home' ? 'history' : event.key === 'End' ? 'favorites' : tab === 'history' ? 'favorites' : 'history'
            setTab(next); document.getElementById(`${next}-tab`)?.focus()
          }}>
            <button id="history-tab" role="tab" tabIndex={tab === 'history' ? 0 : -1} aria-selected={tab === 'history'} aria-controls="dice-records" className={`min-h-11 flex-1 border-b-2 text-sm ${tab === 'history' ? 'border-[#96723a] font-semibold text-[#765721]' : 'border-transparent text-slate-500'}`} onClick={() => setTab('history')}>Histórico <span className="text-xs">{saved.history.length}</span></button>
            <button id="favorites-tab" role="tab" tabIndex={tab === 'favorites' ? 0 : -1} aria-selected={tab === 'favorites'} aria-controls="dice-records" className={`min-h-11 flex-1 border-b-2 text-sm ${tab === 'favorites' ? 'border-[#96723a] font-semibold text-[#765721]' : 'border-transparent text-slate-500'}`} onClick={() => setTab('favorites')}>Favoritos <span className="text-xs">{saved.favorites.length}</span></button>
          </div>
          <div id="dice-records" role="tabpanel" aria-labelledby={`${tab}-tab`}>
            {tab === 'history' ? <>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">As últimas {HISTORY_LIMIT} jogadas da sua aventura. Toque em uma combinação para prepará-la de novo.</p>
              {!saved.history.length && <div className="py-10 text-center text-slate-500"><Icon icon="game-icons:scroll-quill" width={36} className="mx-auto mb-3 text-[#ac9668]" /><p className="font-crimson text-lg">Toda aventura começa<br />com uma primeira rolagem.</p></div>}
              <ol className="max-h-[540px] space-y-2 overflow-y-auto">{saved.history.map(item => <li key={item.id}><button disabled={busy} onClick={() => prepare(item)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#ded5c3] bg-white/60 p-3 text-left hover:border-[#96723a] disabled:opacity-50" aria-label={`Preparar ${notation(item)}, resultado anterior ${item.total}`}><span className="min-w-0"><span className="block break-words text-sm font-semibold">{notation(item)}</span><span className="mt-1 block text-[11px] text-slate-500">{new Date(item.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span><span className="mt-1 block break-words text-[11px] text-slate-500">{item.dice.map(die => die.value).join(' · ')}</span></span><span className="font-cinzel text-2xl text-[#81602d]">{item.total}</span></button></li>)}</ol>
              {saved.history.length > 0 && <button className="mt-3 min-h-11 text-xs text-slate-500 underline underline-offset-4" disabled={busy} onClick={() => { if (window.confirm('Apagar o histórico de rolagens deste navegador? Seus favoritos serão mantidos.')) persist({ ...ledger.current, history: [] }) }}>Limpar histórico</button>}
            </> : <>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">Suas combinações de confiança, sempre à mão. Selecionar um favorito prepara os dados.</p>
              {!saved.favorites.length && <p className="py-6 text-center font-crimson text-lg text-slate-500">Guarde aqui sua jogada favorita.</p>}
              <ul className="max-h-[420px] space-y-2 overflow-y-auto">{saved.favorites.map(item => <li key={item.id} className="flex items-center rounded-lg border border-[#ded5c3] bg-white/60"><button disabled={busy} className="min-h-14 min-w-0 flex-1 p-3 text-left hover:bg-amber-50 disabled:opacity-50" onClick={() => prepare(item)}><span className="block break-words text-sm font-semibold">{item.name}</span><span className="mt-1 block text-xs text-[#81602d]">{notation(item)}</span></button><button className="min-h-11 min-w-11 text-slate-400 hover:text-red-700" aria-label={`Remover favorito ${item.name}`} onClick={() => persist({ ...ledger.current, favorites: ledger.current.favorites.filter(f => f.id !== item.id) })}><Icon icon="mdi:close" width={18} className="mx-auto" /></button></li>)}</ul>
            </>}
          </div>
          <form className="mt-5 border-t border-[#ded5c3] pt-4" onSubmit={event => { event.preventDefault(); saveFavorite() }}><label htmlFor="favorite-name" className="mb-2 block text-xs font-semibold">Salvar combinação atual</label><input id="favorite-name" maxLength={60} placeholder="Nome da jogada (opcional)" value={favoriteName} onChange={event => setFavoriteName(event.target.value)} className={field} /><button className={`${button} mt-2 w-full text-[#765721]`} disabled={!count || !modifierValid || !storageReady || busy}><Icon icon="mdi:star-outline" width={18} /> Salvar favorito</button></form>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><Icon icon="mdi:content-save-outline" width={16} className="shrink-0" />Salvos apenas neste navegador. Limpar os dados do site apaga seus registros.</p>
          {storageError && <p role="alert" className="mt-3 text-xs text-red-800">{storageError}</p>}
        </aside>
      </div>
      <p className="font-manuscript mt-8 text-center text-sm italic text-[#8b795a]">Que a Chama Branca ilumine seus caminhos — e seus dados.</p>
    </div>
  </main>
}
