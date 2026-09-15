'use client'

import { Icon } from '@iconify/react'
import { useRef, useState } from 'react'

export function slideDistance(startY: number, currentY: number) {
  return Math.max(0, Math.min(40, startY - currentY))
}

export default function RollSlider({ disabled, busy, onRoll }: { disabled: boolean; busy: boolean; onRoll: () => void }) {
  const drag = useRef<{ id: number; y: number } | null>(null)
  const [distance, setDistance] = useState(0)

  function reset() { drag.current = null; setDistance(0) }

  return <div className="mx-auto flex max-w-sm flex-row-reverse items-center justify-between gap-4">
    <div className="relative h-24 w-14 shrink-0 rounded-full border border-[#ad8c4d] bg-[#172b40]">
      <Icon icon="mdi:chevron-double-up" width={26} className="absolute left-1/2 top-3 -translate-x-1/2 text-[#dbc799]" aria-hidden="true" />
      <button type="button" aria-label="Rolar os dados" aria-describedby="roll-gesture-hint" disabled={disabled}
        className="absolute bottom-1 left-1 h-12 w-12 touch-none select-none rounded-full bg-[#bda262] text-[#111e2f] shadow-md disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
        style={{ transform: `translateY(-${distance}px)` }}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return
          drag.current = { id: event.pointerId, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => {
          if (drag.current?.id === event.pointerId) setDistance(slideDistance(drag.current.y, event.clientY))
        }}
        onPointerUp={event => {
          const complete = drag.current?.id === event.pointerId && slideDistance(drag.current.y, event.clientY) >= 30
          reset()
          if (complete && !disabled) onRoll()
        }}
        onPointerCancel={reset} onLostPointerCapture={reset}
        onClick={event => { if (event.detail === 0) onRoll() }}>
        <Icon icon="game-icons:rolling-dices" width={28} className="mx-auto" />
      </button>
    </div>
    <div className="max-w-56">
      <p id="roll-gesture-hint" className="text-base font-semibold leading-snug text-amber-50">{busy ? 'Rolando os dados…' : distance >= 30 ? 'Solte para lançar' : 'Deslize para cima'}</p>
      <button type="button" disabled={disabled} onClick={onRoll} className="min-h-11 text-sm text-[#dbc799] underline underline-offset-4 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-amber-200">Ou toque para rolar</button>
    </div>
  </div>
}
