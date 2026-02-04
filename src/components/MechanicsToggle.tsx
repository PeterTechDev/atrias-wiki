'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface MechanicsToggleProps {
  title?: string
  children: React.ReactNode
}

export default function MechanicsToggle({ title = 'Estatísticas de Jogo', children }: MechanicsToggleProps) {
  const [showMechanics, setShowMechanics] = useState(false)

  return (
    <div className="border-t border-amber-200 pt-4 mt-4">
      <button
        onClick={() => setShowMechanics(!showMechanics)}
        className="flex items-center gap-2 text-amber-700 hover:text-amber-600 text-sm font-medium transition-colors"
      >
        <Icon icon="game-icons:dice-twenty-faces-twenty" className="w-4 h-4" />
        {showMechanics ? `Ocultar ${title}` : `Ver ${title}`}
        <Icon icon={showMechanics ? "game-icons:arrow-up" : "game-icons:arrow-down"} className="w-3 h-3" />
      </button>

      {showMechanics && (
        <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-300">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-3">
            <Icon icon="game-icons:perspective-dice-six-faces-random" className="w-4 h-4" />
            Informações Mecânicas (D&D 5e)
          </div>
          {children}
        </div>
      )}
    </div>
  )
}
