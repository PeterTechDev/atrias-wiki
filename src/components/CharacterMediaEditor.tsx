'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { CharacterMedia } from '@/lib/characterMedia'
import { useId } from 'react'
import { ImageUpload } from './ImageUpload'
import { isMediaUrl } from '@/lib/characterMedia'

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-800'

export function CharacterMediaEditor({ media, onChange, title = 'Imagens e vídeos', imagesOnly = false, onBusyChange }: { media: CharacterMedia[]; onChange: (media: CharacterMedia[]) => void; title?: string; imagesOnly?: boolean; onBusyChange?: (busy: boolean) => void }) {
  const titleId = useId()
  function update(index: number, patch: Partial<CharacterMedia>) {
    onChange(media.map((item, i) => i === index ? { ...item, ...patch } : item))
  }
  function move(index: number, step: number) {
    const next = [...media]
    ;[next[index], next[index + step]] = [next[index + step], next[index]]
    onChange(next)
  }

  return <section aria-labelledby={titleId} className="text-slate-800">
    <p id={titleId} className="font-semibold">{title}</p>
    <p className="mt-1 text-sm text-slate-600">A primeira mídia aparece em destaque. {imagesOnly ? 'Adicione o endereço da imagem ou envie uma foto.' : 'Use endereços de imagens ou arquivos de vídeo (MP4, WebM), não links de páginas do YouTube.'}</p>
    {!media.length && <p className="my-4 text-sm text-slate-600">Nenhuma mídia adicionada. A página funciona também sem imagens.</p>}
    <div className="divide-y divide-slate-200">
      {media.map((item, index) => <fieldset key={index} className="py-5">
        <legend className="sr-only">Mídia {index + 1}</legend>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold">{index === 0 ? 'Mídia principal' : `Mídia ${index + 1}`}</span>
          <div className="flex gap-1 [&_button]:flex [&_button]:h-11 [&_button]:w-11 [&_button]:items-center [&_button]:justify-center [&_button]:rounded [&_button]:hover:bg-slate-100 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-amber-800 [&_button]:disabled:opacity-30">
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover mídia ${index + 1} para cima`}><ArrowUp aria-hidden="true" size={18} /></button>
            <button type="button" disabled={index === media.length - 1} onClick={() => move(index, 1)} aria-label={`Mover mídia ${index + 1} para baixo`}><ArrowDown aria-hidden="true" size={18} /></button>
            <button type="button" onClick={() => onChange(media.filter((_, i) => i !== index))} aria-label={`Remover mídia ${index + 1}`}><Trash2 aria-hidden="true" size={18} /></button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {!imagesOnly && <label className="block text-sm">Tipo<select value={item.type} onChange={event => update(index, { type: event.target.value as CharacterMedia['type'] })} className={inputClass}><option value="image">Imagem</option><option value="video">Vídeo</option></select></label>}
          <label className="block text-sm">Endereço do arquivo<input required value={item.src} maxLength={2048} placeholder="https://… ou /images/…" onChange={event => update(index, { src: event.target.value.trim() })} className={inputClass} /></label>
          <label className="block text-sm">Legenda (opcional)<input value={item.caption ?? ''} maxLength={1000} onChange={event => update(index, { caption: event.target.value })} className={inputClass} /></label>
          <label className="block text-sm">Crédito / autoria (opcional)<input value={item.credit ?? ''} maxLength={1000} onChange={event => update(index, { credit: event.target.value })} className={inputClass} /></label>
          {item.type === 'image' ? <label className="block text-sm sm:col-span-2">Descrição da imagem para leitores de tela<input value={item.alt ?? ''} maxLength={1000} onChange={event => update(index, { alt: event.target.value })} className={inputClass} /></label> : <>
            <label className="block text-sm">Imagem de capa (opcional)<input value={item.poster ?? ''} maxLength={2048} onChange={event => update(index, { poster: event.target.value.trim() })} className={inputClass} /></label>
            <label className="block text-sm">Legendas em português (.vtt, opcional)<input value={item.captions ?? ''} maxLength={2048} onChange={event => update(index, { captions: event.target.value.trim() })} className={inputClass} /></label>
          </>}
        </div>
        {onBusyChange && item.type === 'image' && <div className="mt-4"><ImageUpload onUpload={src => update(index, { src })} onBusyChange={onBusyChange} /></div>}
        {item.type === 'image' && isMediaUrl(item.src) && <img src={item.src} alt={item.alt || 'Prévia da imagem'} className="mt-4 max-h-40 max-w-full rounded object-contain" />}
      </fieldset>)}
    </div>
    <button type="button" disabled={media.length >= 50} onClick={() => onChange([...media, { type: 'image', src: '' }])} className="inline-flex min-h-11 items-center gap-2 rounded border border-amber-800 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-800 disabled:opacity-50"><Plus aria-hidden="true" size={18} />Adicionar mídia</button>
  </section>
}
