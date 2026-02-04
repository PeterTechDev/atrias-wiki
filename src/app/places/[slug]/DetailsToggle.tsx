'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface DetailsToggleProps {
  population: string
  government: string
  dangerLevel: string
  climate: string
}

export default function DetailsToggle({ population, government, dangerLevel, climate }: DetailsToggleProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      {/* Quick Stats Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-amber-700 hover:text-amber-600 text-sm font-medium transition-colors"
      >
        <Icon icon="game-icons:info" className="w-4 h-4" />
        {showDetails ? 'Ocultar detalhes' : 'Ver detalhes rápidos'}
        <Icon icon={showDetails ? "game-icons:arrow-up" : "game-icons:arrow-down"} className="w-3 h-3" />
      </button>

      {/* Quick Stats (Collapsible) */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-amber-200 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Icon icon="game-icons:village" className="w-4 h-4 text-amber-700" />
            <span className="text-slate-600">População:</span>
            <span className="text-slate-800 font-medium">{population}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="game-icons:crown" className="w-4 h-4 text-amber-700" />
            <span className="text-slate-600">Governo:</span>
            <span className="text-slate-800 font-medium">{government}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="game-icons:shield" className="w-4 h-4 text-amber-700" />
            <span className="text-slate-600">Perigo:</span>
            <span className={`font-medium ${
              dangerLevel === 'Baixo' ? 'text-green-700' : 
              dangerLevel === 'Médio' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {dangerLevel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="game-icons:thermometer-cold" className="w-4 h-4 text-amber-700" />
            <span className="text-slate-600">Clima:</span>
            <span className="text-slate-800 font-medium">{climate}</span>
          </div>
        </div>
      )}
    </>
  )
}
