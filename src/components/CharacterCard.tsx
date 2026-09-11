'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Box, ImageOff, X } from 'lucide-react'
import type { CharacterCard as Card } from '@/lib/characterCard'
import styles from './CharacterCard.module.css'

export function CharacterCardViewer({ card, name }: { card: Card; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  return <>
    <button type="button" className={styles.trigger} aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); setOpen(true) }}>
      <Box aria-hidden="true" size={16} />Ver card 3D
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <div className={styles.dialogHeader}>
        <h2 id={titleId}>Card 3D de {name}</h2>
        <button type="button" aria-label="Fechar card 3D" onClick={() => dialog.current?.close()}><X aria-hidden="true" size={20} /></button>
      </div>
      {open && <CharacterCard card={card} name={name} />}
    </dialog>
  </>
}

export function CharacterCard({ card, name }: { card: Card; name: string }) {
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const hintId = useId()
  function checkImage(image: HTMLImageElement | null) {
    if (image?.complete && !image.naturalWidth) setFailed(true)
  }

  return <figure className={styles.figure}>
    {failed ? <div className={styles.error} role="status">
      <ImageOff aria-hidden="true" size={28} />
      <p>Não foi possível carregar o card 3D.</p>
      <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>Tentar novamente</button>
    </div> : <div className={styles.stage} onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(true) }} onPointerLeave={event => { if (event.pointerType === 'mouse') setActive(false) }}>
      <button type="button" className={styles.card} data-active={active} aria-pressed={active} aria-label={`Ativar efeito 3D de ${name}`} aria-describedby={hintId} onPointerUp={event => { if (event.pointerType !== 'mouse') setActive(value => !value) }} onClick={event => { if (event.detail === 0) setActive(value => !value) }} onKeyDown={event => { if (event.key === 'Escape') setActive(false) }}>
        {/* Editorial URLs may be local or remote; keep the transparent foreground intact. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={checkImage} key={`background:${attempt}`} src={card.background} alt="" className={styles.background} loading="lazy" onError={() => setFailed(true)} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={checkImage} key={`foreground:${attempt}`} src={card.foreground} alt={card.alt || name} className={styles.foreground} loading="lazy" onError={() => setFailed(true)} />
        <span className={styles.name} aria-hidden="true">{name}</span>
      </button>
    </div>}
    <figcaption className={styles.caption}>
      <span className={styles.nameSpace} aria-hidden="true">{name}</span>
      <p id={hintId} className={styles.hint}>Passe o mouse, toque ou use Enter para explorar.</p>
      <p className={styles.staticHint}>Ilustração de {name}.</p>
      {card.credit && <p>Crédito: {card.credit}</p>}
    </figcaption>
  </figure>
}
