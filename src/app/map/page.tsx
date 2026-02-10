/**
 * Interactive World Map of Átrias
 * Zoomable, pannable high-resolution map using Leaflet
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

// Map markers for known locations
// coords: [x, y] where x=horizontal from left, y=from TOP of image
// Leaflet uses [lat,lng]=[y,x] with y flipped (imageHeight - y)
const IMAGE_HEIGHT = 7842

type LocationCategory = 'local' | 'reino'

const locations = [
  // Key locations (Solária region)
  { name: 'Abrigo de Solária', coords: [2426, 4851], type: 'Vila', link: '/places/abrigo-de-solaria', description: 'Uma vila acolhedora nas Colinas do Serpeio', category: 'local' as LocationCategory },
  { name: 'Vigília de Akos', coords: [2812, 4630], type: 'Cidade', link: '/places/vigilia-de-akos', description: 'Cidade às portas da Mortalha Negra', category: 'local' as LocationCategory },
  { name: 'Pengram', coords: [2334, 5008], type: 'Cidade', link: null, description: 'Cidade ao sul, além das Colinas do Serpeio', category: 'local' as LocationCategory },
  { name: 'A Mortalha', coords: [2768, 4689], type: 'Floresta', link: '/places/mortalha', description: 'Floresta da Mortalha Negra — densa e cheia de mistérios', category: 'local' as LocationCategory },
  { name: 'Portão do Vale', coords: [2899, 4930], type: 'Fortaleza', link: null, description: 'Passagem fortificada ao sul da Mortalha', category: 'local' as LocationCategory },
  { name: 'Forte da Aliança', coords: [2686, 5048], type: 'Fortaleza', link: null, description: 'Forte estratégico, guardião das rotas comerciais', category: 'local' as LocationCategory },
  { name: 'Valtriunfo', coords: [2470, 4578], type: 'Cidade', link: null, description: 'Cidade ao norte, próxima à Grande Fonte de Aurun', category: 'local' as LocationCategory },
  // Reinos (kingdoms/major regions)
  { name: 'Skeld', coords: [4370, 1781], type: 'Reino', link: '/places/skeld', description: 'Reino ao norte', category: 'reino' as LocationCategory },
  { name: 'Skelligard', coords: [2817, 1495], type: 'Reino', link: null, description: 'Região gelada ao noroeste', category: 'reino' as LocationCategory },
  { name: 'Norbria', coords: [2359, 2824], type: 'Reino', link: '/places/norbria', description: 'Reino central', category: 'reino' as LocationCategory },
  { name: 'Humma', coords: [2786, 3263], type: 'Reino', link: '/places/humma', description: 'Reino ao centro-leste', category: 'reino' as LocationCategory },
  { name: 'Elendel', coords: [1723, 3642], type: 'Reino', link: '/places/elendel', description: 'Reino a oeste', category: 'reino' as LocationCategory },
  { name: 'Nerania', coords: [2554, 3865], type: 'Reino', link: null, description: 'Região central', category: 'reino' as LocationCategory },
  { name: 'Falandir', coords: [1724, 5003], type: 'Reino', link: '/places/falandir', description: 'Reino ao sudoeste', category: 'reino' as LocationCategory },
  { name: 'Zarkovia', coords: [2481, 5447], type: 'Reino', link: null, description: 'Reino ao sul', category: 'reino' as LocationCategory },
  { name: 'Ardanore', coords: [2588, 6211], type: 'Reino', link: null, description: 'Reino ao extremo sul', category: 'reino' as LocationCategory },
  { name: 'Zaoh', coords: [4396, 5923], type: 'Reino', link: null, description: 'Reino ao sudeste', category: 'reino' as LocationCategory },
  { name: 'Raruna', coords: [4845, 5176], type: 'Reino', link: null, description: 'Reino a leste', category: 'reino' as LocationCategory },
  { name: 'Kandar', coords: [6302, 5104], type: 'Reino', link: '/places/kandar', description: 'Reino ao extremo leste', category: 'reino' as LocationCategory },
]

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileLocations, setShowMobileLocations] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeCategory, setActiveCategory] = useState<LocationCategory | null>('local')

  // Filter locations based on search and category
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = searchQuery === '' || 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || loc.category === activeCategory || searchQuery !== ''
    return matchesSearch && matchesCategory
  })

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
      const imageHeight = IMAGE_HEIGHT

      // Create map with simple CRS (for images)
      const map = L.map(mapContainer.current!, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: false,
        zoomControl: false, // Disable default zoom controls
      })

      // Calculate bounds
      const bounds = [[0, 0], [imageHeight, imageWidth]] as [[number, number], [number, number]]

      // Add image overlay
      L.imageOverlay('/world-map.jpg', bounds).addTo(map)

      // Fit map to image bounds
      map.fitBounds(bounds)
      map.setMaxBounds(bounds)

      // Marker icons
      const localIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin"></div>`,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
      })

      const reinoIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-reino"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -12],
      })

      // Add markers for locations
      locations.forEach((loc) => {
        const icon = loc.category === 'reino' ? reinoIcon : localIcon
        const marker = L.marker([IMAGE_HEIGHT - loc.coords[1], loc.coords[0]] as [number, number], {
          icon,
          title: loc.name,
        })
          .addTo(map)
          .on('click', () => setSelectedLocation(loc))

        marker.bindPopup(`
          <div class="map-popup">
            <strong>${loc.name}</strong>
            <span class="popup-type">${loc.type}</span>
          </div>
        `)
      })

      // Debug: click to get coordinates
      map.on('click', (e: any) => {
        const x = Math.round(e.latlng.lng)
        const y = Math.round(IMAGE_HEIGHT - e.latlng.lat)
        const coordStr = `[${x}, ${y}]`
        navigator.clipboard?.writeText(coordStr)
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`<div style="font-family:monospace;font-size:14px"><b>coords: ${coordStr}</b><br/><small>x=${x}, y=${y} (copied!)</small></div>`)
          .openOn(map)
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
      // Toggle: clicking same location deselects
      if (selectedLocation?.name === loc.name) {
        setSelectedLocation(null)
        return
      }
      const zoom = loc.category === 'reino' ? -0.5 : 0.5
      mapRef.current.flyTo([IMAGE_HEIGHT - loc.coords[1], loc.coords[0]], zoom, {
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
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Location List */}
        <aside className="w-64 bg-[#0d1f35] border-r border-amber-900/30 overflow-y-auto hidden lg:block">
          <div className="p-4">
            {/* Search Input */}
            <div className="relative mb-3">
              <Icon icon="game-icons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-amber-900/30 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-600/50"
              />
            </div>

            {/* Category tabs */}
            {!searchQuery && (
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setActiveCategory(activeCategory === 'local' ? null : 'local')}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors font-semibold ${activeCategory === 'local' ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300'}`}
                >
                  Locais
                </button>
                <button
                  onClick={() => setActiveCategory(activeCategory === 'reino' ? null : 'reino')}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors font-semibold ${activeCategory === 'reino' ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40' : 'bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300'}`}
                >
                  Reinos
                </button>
              </div>
            )}

            <div className="space-y-1">
              {filteredLocations.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Nenhum local encontrado</p>
              ) : filteredLocations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => flyToLocation(loc)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedLocation?.name === loc.name
                      ? 'bg-amber-600/20 border border-amber-600/40'
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon={
                        loc.type === 'Vila' ? 'game-icons:village' : 
                        loc.type === 'Floresta' ? 'game-icons:forest' :
                        loc.type === 'Fortaleza' ? 'game-icons:tower-bridge' :
                        loc.type === 'Landmark' ? 'game-icons:waterfall' :
                        loc.type === 'Reino' ? 'game-icons:crown' :
                        loc.type === 'Porto' ? 'game-icons:anchor' : 'game-icons:castle'
                      } 
                      className="w-3.5 h-3.5 text-amber-500" 
                    />
                    <span className="text-white text-sm">{loc.name}</span>
                  </div>
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
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#0d1f35]/95 backdrop-blur border border-amber-900/50 rounded-lg p-4 z-[1000]">
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
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
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

          {/* Mobile Locations Button */}
          <button
            onClick={() => setShowMobileLocations(true)}
            className="lg:hidden absolute top-4 left-4 px-4 py-2 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center gap-2 text-amber-400 hover:bg-amber-600/20 transition-colors z-[1000]"
          >
            <Icon icon="game-icons:compass" className="w-5 h-5" />
            <span className="text-sm font-medium">Locais</span>
          </button>

          {/* Mobile Locations Panel */}
          {showMobileLocations && (
            <div className="lg:hidden fixed inset-0 z-[2000] flex flex-col">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60"
                onClick={() => setShowMobileLocations(false)}
              />
              
              {/* Panel */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0d1f35] border-t border-amber-900/50 rounded-t-2xl max-h-[70vh] overflow-hidden flex flex-col">
                {/* Handle */}
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1 bg-amber-900/50 rounded-full" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-amber-900/30">
                  <h2 className="font-cinzel text-amber-400 text-lg">Locais Conhecidos</h2>
                  <button 
                    onClick={() => setShowMobileLocations(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Icon icon="game-icons:cross-mark" className="w-6 h-6" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="px-4 py-3">
                  <div className="relative">
                    <Icon icon="game-icons:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar local..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/50 border border-amber-900/30 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-600/50"
                    />
                  </div>
                </div>
                
                {/* Locations List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                  {filteredLocations.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">Nenhum local encontrado</p>
                  ) : filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => {
                        flyToLocation(loc)
                        setShowMobileLocations(false)
                      }}
                      className="w-full text-left p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-transparent active:border-amber-600/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          icon={
                            loc.type === 'Vila' ? 'game-icons:village' : 
                            loc.type === 'Floresta' ? 'game-icons:forest' :
                            loc.type === 'Fortaleza' ? 'game-icons:tower-bridge' :
                            loc.type === 'Landmark' ? 'game-icons:waterfall' :
                            loc.type === 'Porto' ? 'game-icons:anchor' : 'game-icons:castle'
                          } 
                          className="w-6 h-6 text-amber-500" 
                        />
                        <div>
                          <span className="text-white font-medium block">{loc.name}</span>
                          <span className="text-slate-400 text-sm">{loc.type} • {loc.description}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
        .marker-reino {
          width: 12px;
          height: 12px;
          background: rgba(217, 119, 6, 0.6);
          border: 2px solid #fbbf24;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
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
