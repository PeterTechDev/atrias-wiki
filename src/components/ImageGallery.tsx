'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Expand, ImageOff, Play, X } from 'lucide-react'
import type { CharacterMedia } from '@/lib/characterMedia'

function MediaAsset({ item, name, expanded = false }: { item: CharacterMedia; name: string; expanded?: boolean }) {
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const src = item.type === 'video' && !expanded ? item.poster : item.src
  if (failed) return <span className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center text-stone-200" role="status">
    <ImageOff aria-hidden="true" className="h-8 w-8" />
    <span>Não foi possível carregar {item.type === 'video' ? 'o vídeo' : 'a imagem'}.</span>
    {expanded && <button type="button" className="min-h-11 rounded px-4 underline underline-offset-4" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Tentar novamente</button>}
  </span>
  if (item.type === 'video' && expanded) return <video key={attempt} src={item.src} controls playsInline preload="metadata" poster={item.poster || undefined} onError={() => setFailed(true)} className="max-h-[65dvh] w-full" aria-label={item.caption || `Vídeo de ${name}`}>
    {item.captions && <track kind="captions" src={item.captions} srcLang="pt-BR" label="Português" default />}
    Seu navegador não suporta este vídeo.
  </video>
  if (!src) return <span className="flex min-h-64 items-center justify-center"><Play aria-hidden="true" className="h-16 w-16 text-[#c6a862]" /></span>
  // Remote editorial assets preserve their proportions without image-host configuration.
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={attempt} src={src} alt={item.alt || item.caption || name} onError={() => setFailed(true)} className={expanded ? 'mx-auto max-h-[65dvh] max-w-full object-contain' : 'max-h-[34rem] w-full object-contain'} fetchPriority={expanded ? 'auto' : 'high'} />
}

export default function ImageGallery({ media, name }: { media: CharacterMedia[]; name: string }) {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const current = media[index] ?? media[0]

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  if (!current) return null
  function show() { setOpen(true); dialog.current?.showModal() }
  function move(step: number) { setIndex(value => (value + step + media.length) % media.length) }

  return <div className="min-w-0 scroll-mt-6">
    <figure>
      <button type="button" onClick={show} aria-label={current.type === 'video' ? `Ver vídeo de ${name}` : `Ampliar imagem de ${name}`} className="group relative block w-full overflow-hidden rounded-xl bg-[#0a1628] text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">
        <MediaAsset key={`${index}:${current.src}`} item={current} name={name} />
        <span className="absolute right-4 bottom-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0a1628]/90 px-3 text-sm group-hover:bg-[#0a1628]">
          {current.type === 'video' ? <Play aria-hidden="true" className="h-4 w-4" /> : <Expand aria-hidden="true" className="h-4 w-4" />}
          {current.type === 'video' ? 'Ver vídeo' : 'Ampliar'}
        </span>
      </button>
      {(current.caption || current.credit) && <figcaption className="mt-3 text-sm leading-relaxed text-[#665b49]">
        {current.caption}{current.credit && <span className="block">Crédito: {current.credit}</span>}
      </figcaption>}
    </figure>

    {media.length > 1 && <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm text-[#665b49]"><span>Imagens e vídeos</span><span aria-live="polite">{index + 1} de {media.length}</span></div>
      <div className="flex gap-3 overflow-x-auto px-1 py-1" aria-label="Selecionar mídia">
        {media.map((item, i) => <button key={`${i}:${item.src}`} type="button" aria-label={`${item.type === 'video' ? 'Vídeo' : 'Imagem'} ${i + 1}${item.caption ? `: ${item.caption}` : ''}`} aria-pressed={index === i} onClick={() => setIndex(i)} className={`relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0a1628] text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-amber-800 ${index === i ? 'ring-2 ring-amber-800 ring-offset-2 ring-offset-[#e8dcc8]' : 'opacity-70 hover:opacity-100'}`}>
          {(item.type === 'image' || item.poster) &&
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.type === 'image' ? item.src : item.poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
          {item.type === 'video' && <Play aria-hidden="true" className="absolute h-7 w-7 rounded-full bg-[#0a1628]/80 p-1" />}
        </button>)}
      </div>
    </div>}

    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} onKeyDown={event => {
      if (event.target instanceof HTMLVideoElement) return
      if (media.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) }
    }} className="fixed inset-0 m-auto max-h-[95dvh] w-[min(72rem,96vw)] max-w-none overflow-y-auto rounded-xl bg-[#0a1628] p-4 text-[#f5efe5] backdrop:bg-black/85 sm:p-6 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-amber-300">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={titleId} className="min-w-0 break-words font-crimson text-xl">{name}{media.length > 1 && <span className="ml-3 text-sm tabular-nums">{index + 1} / {media.length}</span>}</h2>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Fechar galeria" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-white/10"><X aria-hidden="true" /></button>
      </div>
      {open && <MediaAsset key={`${index}:${current.src}`} item={current} name={name} expanded />}
      {open && current.type === 'image' && <a href={current.src} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-11 items-center justify-center text-sm text-amber-200 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-amber-300">Abrir imagem original em nova aba</a>}
      {(current.caption || current.credit) && <p className="mt-4 text-center font-crimson text-lg">{current.caption}{current.credit && <span className="block text-sm text-stone-300">Crédito: {current.credit}</span>}</p>}
      {media.length > 1 && <div className="mt-4 flex items-center justify-between gap-4">
        <button type="button" onClick={() => move(-1)} className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 hover:bg-white/10"><ArrowLeft aria-hidden="true" className="h-5 w-5" />Anterior</button>
        <button type="button" onClick={() => move(1)} className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 hover:bg-white/10">Próxima<ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
      </div>}
    </dialog>
  </div>
}
