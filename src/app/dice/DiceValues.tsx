import { Icon } from '@iconify/react'
import type { DiceResult } from '@/lib/dice'

export default function DiceValues({ dice }: { dice: DiceResult[] }) {
  return <ol aria-label="Valores dos dados" tabIndex={0} className="mt-2 flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-color:#90713b_transparent] focus-visible:outline-2 focus-visible:outline-amber-200 sm:mt-3 sm:flex-wrap sm:items-end sm:gap-2">
    {dice.map((die, index) => {
      const maximum = die.value === die.sides
      const minimum = die.value === 1
      const extreme = maximum || minimum
      const natural = extreme && die.sides === 20
      const label = natural ? `${die.value} natural` : maximum ? 'Máximo' : minimum ? 'Mínimo' : ''
      return <li key={index} aria-label={`d${die.sides}: ${die.value}${label ? ` · ${label}` : ''}`}
        className={`flex shrink-0 items-center justify-center gap-1.5 rounded-md border px-2 py-1 sm:flex-col sm:gap-0 sm:rounded-lg sm:px-3 sm:py-2 ${natural ? 'sm:min-w-28 sm:gap-1 sm:px-4 sm:py-3' : 'sm:min-w-14'} ${maximum ? 'border-amber-300/70 bg-amber-300/15 text-amber-200' : minimum ? 'border-rose-300/60 bg-rose-300/10 text-rose-200' : 'border-transparent text-slate-300'}`}>
        <span aria-hidden="true" className="text-xs">d{die.sides}</span>
        <strong aria-hidden="true" className={`font-cinzel leading-none ${natural ? 'text-2xl sm:my-1 sm:text-5xl' : extreme ? 'text-xl sm:my-1 sm:text-3xl' : 'text-xl sm:my-1'}`}>{die.value}</strong>
        {extreme && <Icon aria-hidden="true" icon={maximum ? 'mdi:arrow-up' : 'mdi:arrow-down'} width={14} className="sm:hidden" />}
        {label && <span aria-hidden="true" className="sr-only sm:not-sr-only sm:flex sm:items-center sm:gap-1.5 sm:text-xs sm:font-semibold">
          {natural && <Icon icon={maximum ? 'game-icons:flame' : 'game-icons:cracked-shield'} width={18} />}
          {label}
        </span>}
      </li>
    })}
  </ol>
}
