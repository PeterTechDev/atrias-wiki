'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'

interface DetailItem {
  icon: string
  label: string
  value: string
  color?: string
}

interface DetailsToggleProps {
  items: DetailItem[]
}

export default function DetailsToggle({ items }: DetailsToggleProps) {
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
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon icon={item.icon} className="w-4 h-4 text-amber-700" />
              <span className="text-slate-600">{item.label}:</span>
              <span className={`font-medium ${item.color || 'text-slate-800'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
