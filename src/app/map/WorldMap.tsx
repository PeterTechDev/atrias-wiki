/**
 * Interactive World Map of Átrias
 * Zoomable, pannable high-resolution map using Leaflet
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { Map as LeafletMap } from 'leaflet'
import type { MapLocation, LocationCategory } from '@/lib/mapLocations'

// Map markers for known locations
// coords: [x, y] where x=horizontal from left, y=from TOP of image
// Leaflet uses [lat,lng]=[y,x] with y flipped (imageHeight - y)
const IMAGE_HEIGHT = 7842

export default function WorldMap({ locations, initialPlace }: { locations: MapLocation[]; initialPlace?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState(false)
  const [showMobileLocations, setShowMobileLocations] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeCategory, setActiveCategory] = useState<LocationCategory | null>('local')

  const [isLocalExpanded, setIsLocalExpanded] = useState(true)
  const [isReinoExpanded, setIsReinoExpanded] = useState(false)

  // Filter locations based on search and category
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = searchQuery === '' || 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || loc.category === activeCategory || searchQuery !== ''
    return matchesSearch && matchesCategory
  })

  // Expand relevant sections when filtering changes
  useEffect(() => {
    if (searchQuery) {
      setIsLocalExpanded(true)
      setIsReinoExpanded(true)
      return
    }
    if (activeCategory === 'local') {
      setIsLocalExpanded(true)
    }
    if (activeCategory === 'reino') {
      setIsReinoExpanded(true)
    }
  }, [searchQuery, activeCategory])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    let cancelled = false

    // Dynamically import Leaflet (client-side only)
    const initMap = async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapContainer.current) return

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

      mapRef.current = map
      const requested = locations.find(location => location.pages.some(page => page.slug === initialPlace))
      if (requested) {
        map.setView([IMAGE_HEIGHT - requested.coords[1], requested.coords[0]], requested.category === 'reino' ? -0.5 : 0.5)
        setSelectedLocation(requested)
        setActiveCategory(requested.category)
      }
      setIsLoading(false)
    }

    void initMap().catch(() => { if (!cancelled) { setMapError(true); setIsLoading(false) } })

    // Cleanup
    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [locations, initialPlace])

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
    <main className="h-[calc(100dvh-4rem)] flex flex-col bg-[#0a1628]">
      <h1 className="sr-only">Mapa do Mundo</h1>

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

            {filteredLocations.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Nenhum local encontrado</p>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const localLocations = filteredLocations.filter((l) => l.category === 'local')
                  const reinoLocations = filteredLocations.filter((l) => l.category === 'reino')

                  const renderLocation = (loc: (typeof locations)[0]) => (
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
                  )

                  return (
                    <>
                      {localLocations.length > 0 && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setIsLocalExpanded((v) => !v)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                icon={isLocalExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                                className="w-5 h-5 text-amber-400"
                              />
                              <span className="font-cinzel text-amber-300 text-sm tracking-wide">A Mortalha</span>
                            </div>
                            <span className="text-xs text-slate-400">{localLocations.length}</span>
                          </button>
                          {isLocalExpanded && (
                            <div className="space-y-1 pl-2">{localLocations.map(renderLocation)}</div>
                          )}
                        </div>
                      )}

                      {reinoLocations.length > 0 && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setIsReinoExpanded((v) => !v)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                icon={isReinoExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                                className="w-5 h-5 text-amber-400"
                              />
                              <span className="font-cinzel text-amber-300 text-sm tracking-wide">Reinos</span>
                            </div>
                            <span className="text-xs text-slate-400">{reinoLocations.length}</span>
                          </button>
                          {isReinoExpanded && (
                            <div className="space-y-1 pl-2">{reinoLocations.map(renderLocation)}</div>
                          )}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
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
          {mapError && <div role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0a1628] text-amber-100"><p>Não foi possível carregar o mapa.</p><button className="min-h-11 rounded border border-amber-300 px-4" onClick={() => window.location.reload()}>Tentar novamente</button></div>}
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
                aria-label="Fechar informações do lugar" onClick={() => setSelectedLocation(null)}
                className="absolute top-1 right-1 flex h-11 w-11 items-center justify-center text-2xl text-slate-300 hover:text-white"
              >
                <span aria-hidden="true">×</span>
              </button>
              <span className="text-amber-500 text-xs uppercase tracking-wider">{selectedLocation.type}</span>
              <h3 className="font-cinzel text-xl text-white mt-1 pr-6">{selectedLocation.name}</h3>
              <p className="text-slate-300 text-sm mt-2">{selectedLocation.description}</p>
              {selectedLocation.pages.map(place => <Link key={place.slug} href={`/places/${place.slug}`} className="mt-3 flex min-h-11 items-center gap-2 text-sm text-amber-300 underline-offset-4 hover:underline">{selectedLocation.pages.length === 1 ? 'Ver página completa' : place.name}<Icon icon="mdi:arrow-top-right" className="h-4 w-4" /></Link>)}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <button
              aria-label="Aproximar mapa"
              onClick={() => mapRef.current?.zoomIn()}
              className="w-11 h-11 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
            >
              <span aria-hidden="true" className="text-2xl">+</span>
            </button>
            <button
              aria-label="Afastar mapa"
              onClick={() => mapRef.current?.zoomOut()}
              className="w-11 h-11 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
            >
              <span aria-hidden="true" className="text-2xl">−</span>
            </button>
            <button
              onClick={() => mapRef.current?.fitBounds([[0, 0], [7842, 8192]])}
              className="w-11 h-11 bg-[#0d1f35]/90 border border-amber-900/50 rounded-lg flex items-center justify-center text-amber-400 hover:bg-amber-600/20 transition-colors"
              title="Ver mapa completo"
            >
              <span aria-hidden="true" className="text-2xl">⛶</span>
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

                          <div className="flex items-center justify-between px-4 pb-3 border-b border-amber-900/30">
                  <h2 className="font-cinzel text-amber-400 text-lg">Locais Conhecidos</h2>
                  <button 
                    onClick={() => setShowMobileLocations(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Icon icon="game-icons:cross-mark" className="w-6 h-6" />
                  </button>
                </div>

                {/* Category tabs (mobile) */}
                <div className="flex gap-1 px-4 pt-3">
                  <button
                    onClick={() => setActiveCategory(activeCategory === 'local' ? null : 'local')}
                    className={`flex-1 text-sm py-2 rounded transition-colors font-semibold ${activeCategory === 'local' ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40' : 'bg-slate-800/50 text-slate-400 border border-transparent'}`}
                  >
                    Locais
                  </button>
                  <button
                    onClick={() => setActiveCategory(activeCategory === 'reino' ? null : 'reino')}
                    className={`flex-1 text-sm py-2 rounded transition-colors font-semibold ${activeCategory === 'reino' ? 'bg-amber-600/30 text-amber-300 border border-amber-600/40' : 'bg-slate-800/50 text-slate-400 border border-transparent'}`}
                  >
                    Reinos
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
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {filteredLocations.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">Nenhum local encontrado</p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const localLocations = filteredLocations.filter((l) => l.category === 'local')
                        const reinoLocations = filteredLocations.filter((l) => l.category === 'reino')

                        const renderLocation = (loc: (typeof locations)[0]) => (
                          <button
                            key={loc.name}
                            onClick={() => {
                              flyToLocation(loc)
                              setShowMobileLocations(false)
                            }}
                            className={`w-full text-left p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border transition-colors ${
                              selectedLocation?.name === loc.name ? 'border-amber-600/40' : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                icon={
                                  loc.type === 'Vila' ? 'game-icons:village' :
                                  loc.type === 'Floresta' ? 'game-icons:forest' :
                                  loc.type === 'Fortaleza' ? 'game-icons:tower-bridge' :
                                  loc.type === 'Landmark' ? 'game-icons:waterfall' :
                                  loc.type === 'Reino' ? 'game-icons:crown' :
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
                        )

                        return (
                          <>
                            {localLocations.length > 0 && (
                              <div className="space-y-2">
                                <button
                                  onClick={() => setIsLocalExpanded((v) => !v)}
                                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-800/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon={isLocalExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                                      className="w-6 h-6 text-amber-400"
                                    />
                                    <span className="font-cinzel text-amber-300 text-base tracking-wide">A Mortalha</span>
                                  </div>
                                  <span className="text-sm text-slate-400">{localLocations.length}</span>
                                </button>
                                {isLocalExpanded && (
                                  <div className="space-y-2 pl-2">{localLocations.map(renderLocation)}</div>
                                )}
                              </div>
                            )}

                            {reinoLocations.length > 0 && (
                              <div className="space-y-2">
                                <button
                                  onClick={() => setIsReinoExpanded((v) => !v)}
                                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-800/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon={isReinoExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                                      className="w-6 h-6 text-amber-400"
                                    />
                                    <span className="font-cinzel text-amber-300 text-base tracking-wide">Reinos</span>
                                  </div>
                                  <span className="text-sm text-slate-400">{reinoLocations.length}</span>
                                </button>
                                {isReinoExpanded && (
                                  <div className="space-y-2 pl-2">{reinoLocations.map(renderLocation)}</div>
                                )}
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}
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
          font-family: var(--font-cinzel), serif;
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
