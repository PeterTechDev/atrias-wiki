/**
 * Interactive World Map of Átrias
 * Zoomable, pannable high-resolution map using Leaflet
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

// Base path for assets
const basePath = process.env.NODE_ENV === 'production' ? '/atrias-wiki' : ''

// Map markers for known locations
const locations = [
  { 
    name: 'Abrigo de Solaria', 
    coords: [4200, 4600], // Approximate position
    type: 'Vila',
    link: '/places/abrigo-de-solaria',
    description: 'Uma vila acolhedora nas Colinas do Serpeio'
  },
  { 
    name: 'Vigília de Akos', 
    coords: [6800, 3200],
    type: 'Cidade',
    link: null,
    description: 'Cidade a leste, próxima ao Lago Crispin'
  },
  { 
    name: 'Pengram', 
    coords: [3500, 5800],
    type: 'Cidade',
    link: null,
    description: 'Cidade ao sul de Solaria'
  },
  { 
    name: 'Balsa Longa', 
    coords: [4200, 7200],
    type: 'Porto',
    link: null,
    description: 'Porto no extremo sul'
  },
]

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    // Dynamically import Leaflet (client-side only)
    const initMap = async () => {
      const L = (await import('leaflet')).default
      
      // Load CSS dynamically
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Image dimensions
      const imageWidth = 8192
      const imageHeight = 7842

      // Create map with simple CRS (for images)
      const map = L.map(mapContainer.current!, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: false,
      })

      // Calculate bounds
      const bounds = [[0, 0], [imageHeight, imageWidth]] as [[number, number], [number, number]]

      // Add image overlay
      L.imageOverlay(`${basePath}/world-map.jpg`, bounds).addTo(map)

      // Fit map to image bounds
      map.fitBounds(bounds)
      map.setMaxBounds(bounds)

      // Custom marker icon
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin"></div>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40],
      })

      // Add markers for locations
      locations.forEach((loc) => {
        const marker = L.marker([loc.coords[1], loc.coords[0]] as [number, number], {
          icon: markerIcon,
          title: loc.name,
        })
          .addTo(map)
          .on('click', () => setSelectedLocation(loc))

        // Popup
        marker.bindPopup(`
          <div class="map-popup">
            <strong>${loc.name}</strong>
            <span class="popup-type">${loc.type}</span>
          </div>
        `)
      })

      mapRef.current = map
      setIsLoading(false)
    }

    initMap()

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const flyToLocation = (loc: typeof locations[0]) => {
    if (mapRef.current) {
      mapRef.current.flyTo([loc.coords[1], loc.coords[0]], 0, {
        duration: 1,
      })
      setSelectedLocation(loc)
    }
  }

  return (
    <main className="h-screen flex flex-col bg-[#0a1628]">
      {/* Header */}
      <header className="bg-[#0a1628] text-white py-3 px-6 border-b border-amber-900/30 flex-shrink-0">
        <div className="max-w-full flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <Icon icon="game-icons:book-cover" className="w-6 h-6" />
            <span className="font-cinzel text-lg tracking-wider">WIKI ÁTRIAS</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="font-cinzel text-amber-400 text-xl hidden md:block">Mapa do Mundo</h1>
            <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
              <Icon icon="game-icons:house" className="w-5 h-5" />
              <span className="hidden sm:inline">Return Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Location List */}
        <aside className="w-64 bg-[#0d1f35] border-r border-amber-900/30 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h2 className="font-cinzel text-amber-400 text-sm uppercase tracking-wider mb-4">
              Locais Conhecidos
            </h2>
            <div className="space-y-2">
              {locations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => flyToLocation(loc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedLocation?.name === loc.name
                      ? 'bg-amber-600/20 border border-amber-600/40'
                      : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon={loc.type === 'Vila' ? 'game-icons:village' : loc.type === 'Porto' ? 'game-icons:anchor' : 'game-icons:castle'} 
                      className="w-4 h-4 text-amber-500" 
                    />
                    <span className="text-white font-medium text-sm">{loc.name}</span>
                  </div>
                  <span className="text-slate-400 text-xs mt-1 block">{loc.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-amber-900/30">
            <h3 className="font-cinzel text-amber-400 text-xs uppercase tracking-wider mb-3">
              Controles
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Icon icon="game-icons:mouse" className="w-4 h-4" />
                Arraste para mover
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="game-icons:magnifying-glass" className="w-4 h-4" />
                Scroll para zoom
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="game-icons:click" className="w-4 h-4" />
                Clique nos marcadores
              </li>
            </ul>
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628] z-20">
              <div className="text-center">
                <Icon icon="game-icons:compass" className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-amber-400 font-cinzel">Carregando mapa...</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#0d1f35]/95 backdrop-blur border border-amber-900/50 rounded-lg p-4 z-10">
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                <Icon icon="game-icons:cross-mark" className="w-5 h-5" />
              </button>
              <span className="text-amber-500 text-xs uppercase tracking-wider">{selectedLocation.type}</span>
              <h3 className="font-cinzel text-xl text-white mt-1">{selectedLocation.name}</h3>
              <p className="text-slate-300 text-sm mt-2">{selectedLocation.description}</p>
              {selectedLocation.link && (
                <Link 
                  href={selectedLocation.link}
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm mt-3"
                >
                  Ver página completa
                  <Icon icon="game-icons:arrow-scope" className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-10 h-10 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
            >
              <Icon icon="game-icons:magnifying-glass" className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-10 h-10 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
            >
              <Icon icon="game-icons:magnifying-glass" className="w-5 h-5 transform rotate-180" />
            </button>
            <button
              onClick={() => mapRef.current?.fitBounds([[0, 0], [7842, 8192]])}
              className="w-10 h-10 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
              title="Ver mapa completo"
            >
              <Icon icon="game-icons:expand" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .marker-pin {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fbbf24;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        .marker-pin::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        .map-popup {
          text-align: center;
          min-width: 120px;
        }
        .map-popup strong {
          display: block;
          font-family: 'Cinzel', serif;
          color: #0a1628;
          font-size: 14px;
        }
        .popup-type {
          display: block;
          font-size: 11px;
          color: #666;
          margin-top: 2px;
        }
        .leaflet-container {
          background: #0a1628;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
    </main>
  )
}
