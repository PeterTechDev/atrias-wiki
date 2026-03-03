'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

type EntityType =
  | 'character'
  | 'faction'
  | 'place'
  | 'item'
  | 'monster'
  | 'lore'
  | 'session'
  | string

type GraphNode = {
  id: string
  slug: string
  name: string
  type: EntityType
}

type GraphEdge = {
  sourceId: string
  targetId: string
  relationshipType: string
}

type GraphPayload = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

type SimNode = GraphNode & {
  x: number
  y: number
  vx: number
  vy: number
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function nodeColor(type: EntityType): string {
  switch (type) {
    case 'character':
      return '#3b82f6' // blue
    case 'faction':
      return '#ef4444' // red
    case 'place':
      return '#22c55e' // green
    case 'item':
      return '#f59e0b' // gold
    case 'monster':
      return '#a855f7' // purple
    case 'lore':
      return '#94a3b8' // gray
    default:
      return '#64748b' // slate
  }
}

function hrefForEntity(type: EntityType, slug: string): string | null {
  if (!slug) return null
  switch (type) {
    case 'character':
      return `/characters/${slug}`
    case 'faction':
      return `/factions/${slug}`
    case 'place':
      return `/places/${slug}`
    case 'item':
      return `/items/${slug}`
    case 'monster':
      return `/monsters/${slug}`
    case 'lore':
      return `/lore/${slug}`
    // Sessions are stored as entities too, but the UI routes are campaign-based.
    // We keep them visible (if present) but don't navigate.
    case 'session':
      return null
    default:
      return null
  }
}

function distPointToSegmentSquared(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const abLen2 = abx * abx + aby * aby
  if (abLen2 === 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay)
  let t = (apx * abx + apy * aby) / abLen2
  t = clamp(t, 0, 1)
  const cx = ax + abx * t
  const cy = ay + aby * t
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy
}

export default function GraphClient() {
  const router = useRouter()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [payload, setPayload] = useState<GraphPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoverInfo, setHoverInfo] = useState<{ title: string; subtitle: string } | null>(null)
  const hoverInfoRef = useRef<{ title: string; subtitle: string } | null>(null)
  const hoverRafRef = useRef<number | null>(null)

  const simRef = useRef<{ nodes: SimNode[]; edges: GraphEdge[]; idToNode: Map<string, SimNode> } | null>(null)

  // View transform (world -> screen)
  const viewRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })

  const interactionRef = useRef({
    panning: false,
    lastX: 0,
    lastY: 0,
    hoverNodeId: null as string | null,
    hoverEdge: null as { sourceId: string; targetId: string; relationshipType: string } | null,
    mouseX: 0,
    mouseY: 0,
  })

  const legend = useMemo(
    () => [
      { type: 'character', label: 'Character', color: nodeColor('character') },
      { type: 'faction', label: 'Faction', color: nodeColor('faction') },
      { type: 'place', label: 'Place', color: nodeColor('place') },
      { type: 'item', label: 'Item', color: nodeColor('item') },
      { type: 'monster', label: 'Monster', color: nodeColor('monster') },
      { type: 'lore', label: 'Lore', color: nodeColor('lore') },
    ],
    []
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setError(null)
        const res = await fetch('/api/graph', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as GraphPayload

        if (!cancelled) setPayload(json)
      } catch (e: unknown) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setError(msg)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!payload) return

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Filter down to the entity types we can navigate + keep lore/etc.
    // Also drop edges that reference missing nodes (defensive for partial data).
    const allowedNodes = payload.nodes
    const idSet = new Set(allowedNodes.map((n) => n.id))
    const edges = payload.edges.filter((e) => idSet.has(e.sourceId) && idSet.has(e.targetId))

    // Initial positions
    const width = container.clientWidth
    const height = container.clientHeight
    const cx = width / 2
    const cy = height / 2
    const radius = Math.min(width, height) * 0.32

    const nodes: SimNode[] = allowedNodes.map((n, i) => {
      const angle = (i / Math.max(1, allowedNodes.length)) * Math.PI * 2
      const jitter = 0.5 + Math.random() * 0.5
      return {
        ...n,
        x: cx + Math.cos(angle) * radius * jitter,
        y: cy + Math.sin(angle) * radius * jitter,
        vx: 0,
        vy: 0,
      }
    })

    const idToNode = new Map(nodes.map((n) => [n.id, n]))
    simRef.current = { nodes, edges, idToNode }

    // Center view
    viewRef.current.scale = 1
    viewRef.current.offsetX = 0
    viewRef.current.offsetY = 0

    const dpr = window.devicePixelRatio || 1

    function resize() {
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const ro = new ResizeObserver(() => resize())
    ro.observe(container)

    // --- Simulation params ---
    const repulsion = 6000
    const spring = 0.0018
    const springLength = 120
    const damping = 0.86
    const maxSpeed = 6

    function screenToWorld(sx: number, sy: number) {
      const v = viewRef.current
      return {
        x: (sx - v.offsetX) / v.scale,
        y: (sy - v.offsetY) / v.scale,
      }
    }

    function worldToScreen(wx: number, wy: number) {
      const v = viewRef.current
      return {
        x: wx * v.scale + v.offsetX,
        y: wy * v.scale + v.offsetY,
      }
    }

    function findHover(sx: number, sy: number) {
      const sim = simRef.current
      if (!sim) return

      const { nodes, edges, idToNode } = sim
      const world = screenToWorld(sx, sy)

      // Node hit test (world coords)
      const nodeRadius = 12 / viewRef.current.scale
      let hoveredNode: SimNode | null = null
      for (const n of nodes) {
        const dx = world.x - n.x
        const dy = world.y - n.y
        if (dx * dx + dy * dy <= nodeRadius * nodeRadius) {
          hoveredNode = n
          break
        }
      }

      interactionRef.current.hoverNodeId = hoveredNode ? hoveredNode.id : null

      if (hoveredNode) {
        interactionRef.current.hoverEdge = null
        return
      }

      // Edge hover (screen coords threshold)
      let best: { e: GraphEdge; d2: number } | null = null
      const thresholdPx = 10
      for (const e of edges) {
        const a = idToNode.get(e.sourceId)
        const b = idToNode.get(e.targetId)
        if (!a || !b) continue

        const as = worldToScreen(a.x, a.y)
        const bs = worldToScreen(b.x, b.y)
        const d2 = distPointToSegmentSquared(sx, sy, as.x, as.y, bs.x, bs.y)
        if (d2 <= thresholdPx * thresholdPx && (!best || d2 < best.d2)) {
          best = { e, d2 }
        }
      }

      interactionRef.current.hoverEdge = best ? best.e : null
    }

    function tick() {
      const sim = simRef.current
      if (!sim) return

      const { nodes, edges, idToNode } = sim

      // Repulsion (O(n^2) is fine at ~200 nodes)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy + 0.01
          const f = repulsion / d2
          const invD = 1 / Math.sqrt(d2)
          const fx = dx * invD * f
          const fy = dy * invD * f
          a.vx += fx
          a.vy += fy
          b.vx -= fx
          b.vy -= fy
        }
      }

      // Springs
      for (const e of edges) {
        const a = idToNode.get(e.sourceId)
        const b = idToNode.get(e.targetId)
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
        const diff = dist - springLength
        const f = diff * spring
        const fx = (dx / dist) * f
        const fy = (dy / dist) * f
        a.vx += fx
        a.vy += fy
        b.vx -= fx
        b.vy -= fy
      }

      // Integrate
      for (const n of nodes) {
        n.vx *= damping
        n.vy *= damping
        n.vx = clamp(n.vx, -maxSpeed, maxSpeed)
        n.vy = clamp(n.vy, -maxSpeed, maxSpeed)
        n.x += n.vx
        n.y += n.vy
      }

      // Keep hover in sync
      const ir = interactionRef.current
      findHover(ir.mouseX, ir.mouseY)
    }

    function draw() {
      const sim = simRef.current
      if (!sim) return

      const { nodes, edges, idToNode } = sim
      const v = viewRef.current

      const w = container.clientWidth
      const h = container.clientHeight

      // Background
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#050b14'
      ctx.fillRect(0, 0, w, h)

      // Subtle grid
      ctx.save()
      ctx.globalAlpha = 0.08
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      const grid = 80 * v.scale
      const startX = (v.offsetX % grid) - grid
      const startY = (v.offsetY % grid) - grid
      for (let x = startX; x < w + grid; x += grid) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = startY; y < h + grid; y += grid) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.restore()

      // Edges
      const hoverEdge = interactionRef.current.hoverEdge
      for (const e of edges) {
        const a = idToNode.get(e.sourceId)
        const b = idToNode.get(e.targetId)
        if (!a || !b) continue

        const as = { x: a.x * v.scale + v.offsetX, y: a.y * v.scale + v.offsetY }
        const bs = { x: b.x * v.scale + v.offsetX, y: b.y * v.scale + v.offsetY }

        const isHover =
          hoverEdge && hoverEdge.sourceId === e.sourceId && hoverEdge.targetId === e.targetId && hoverEdge.relationshipType === e.relationshipType

        ctx.strokeStyle = isHover ? 'rgba(245, 158, 11, 0.75)' : 'rgba(148, 163, 184, 0.22)'
        ctx.lineWidth = isHover ? 2 : 1
        ctx.beginPath()
        ctx.moveTo(as.x, as.y)
        ctx.lineTo(bs.x, bs.y)
        ctx.stroke()
      }

      // Nodes
      const hoverNodeId = interactionRef.current.hoverNodeId
      for (const n of nodes) {
        const sx = n.x * v.scale + v.offsetX
        const sy = n.y * v.scale + v.offsetY

        const r = 9
        const isHover = hoverNodeId === n.id

        // Outer glow
        ctx.beginPath()
        ctx.arc(sx, sy, isHover ? r + 6 : r + 3, 0, Math.PI * 2)
        ctx.fillStyle = isHover ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.06)'
        ctx.fill()

        // Node circle
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = nodeColor(n.type)
        ctx.fill()

        // Stroke
        ctx.lineWidth = 2
        ctx.strokeStyle = isHover ? 'rgba(245, 158, 11, 0.9)' : 'rgba(15, 23, 42, 0.8)'
        ctx.stroke()

        // Labels (only if zoomed in or hovered)
        if (v.scale >= 1.1 || isHover) {
          ctx.font = isHover ? '600 12px ui-sans-serif' : '12px ui-sans-serif'
          ctx.fillStyle = isHover ? 'rgba(255,255,255,0.95)' : 'rgba(226,232,240,0.8)'
          ctx.textBaseline = 'middle'
          ctx.fillText(n.name, sx + 14, sy)
        }
      }

      // Hover edge label
      if (hoverEdge) {
        const a = idToNode.get(hoverEdge.sourceId)
        const b = idToNode.get(hoverEdge.targetId)
        if (a && b) {
          const ax = a.x * v.scale + v.offsetX
          const ay = a.y * v.scale + v.offsetY
          const bx = b.x * v.scale + v.offsetX
          const by = b.y * v.scale + v.offsetY
          const mx = (ax + bx) / 2
          const my = (ay + by) / 2

          const label = hoverEdge.relationshipType
          ctx.save()
          ctx.font = '600 12px ui-sans-serif'
          const padX = 8
          const padY = 6
          const tw = ctx.measureText(label).width
          const bw = tw + padX * 2
          const bh = 22

          ctx.fillStyle = 'rgba(2,6,23,0.85)'
          ctx.strokeStyle = 'rgba(245,158,11,0.6)'
          ctx.lineWidth = 1

          ctx.beginPath()
          ctx.roundRect(mx - bw / 2, my - bh / 2, bw, bh, 10)
          ctx.fill()
          ctx.stroke()

          ctx.fillStyle = 'rgba(255,255,255,0.95)'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(label, mx, my)
          ctx.restore()
        }
      }
    }

    let raf = 0
    function loop() {
      tick()
      draw()
      raf = window.requestAnimationFrame(loop)
    }

    raf = window.requestAnimationFrame(loop)

    // --- Interactions ---
    function onMouseMove(ev: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      interactionRef.current.mouseX = x
      interactionRef.current.mouseY = y

      if (interactionRef.current.panning) {
        const dx = x - interactionRef.current.lastX
        const dy = y - interactionRef.current.lastY
        interactionRef.current.lastX = x
        interactionRef.current.lastY = y

        viewRef.current.offsetX += dx
        viewRef.current.offsetY += dy
        return
      }

      findHover(x, y)
    }

    function onMouseDown(ev: MouseEvent) {
      if (ev.button !== 0) return
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top

      // Only pan if not over a node
      findHover(x, y)
      if (interactionRef.current.hoverNodeId) return

      interactionRef.current.panning = true
      interactionRef.current.lastX = x
      interactionRef.current.lastY = y
    }

    function onMouseUp() {
      interactionRef.current.panning = false
    }

    function onWheel(ev: WheelEvent) {
      ev.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top

      const v = viewRef.current
      const zoomIntensity = 0.0015
      const delta = -ev.deltaY
      const scaleFactor = Math.exp(delta * zoomIntensity)
      const newScale = clamp(v.scale * scaleFactor, 0.35, 2.5)

      // Zoom towards cursor
      const before = screenToWorld(x, y)
      v.scale = newScale
      const after = screenToWorld(x, y)
      v.offsetX += (after.x - before.x) * v.scale
      v.offsetY += (after.y - before.y) * v.scale
    }

    function onClick(ev: MouseEvent) {
      const sim = simRef.current
      if (!sim) return

      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      findHover(x, y)

      const hovered = interactionRef.current.hoverNodeId
      if (!hovered) return

      const node = sim.idToNode.get(hovered)
      if (!node) return

      const href = hrefForEntity(node.type, node.slug)
      if (href) router.push(href)
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('click', onClick)

    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('click', onClick)
    }
  }, [payload, router])

  const hoverLabel = useMemo(() => {
    const sim = simRef.current
    if (!sim) return null

    const hoverNodeId = interactionRef.current.hoverNodeId
    if (hoverNodeId) {
      const n = sim.idToNode.get(hoverNodeId)
      if (!n) return null
      return { title: n.name, subtitle: n.type }
    }

    const edge = interactionRef.current.hoverEdge
    if (edge) {
      const a = sim.idToNode.get(edge.sourceId)
      const b = sim.idToNode.get(edge.targetId)
      return {
        title: edge.relationshipType,
        subtitle: a && b ? `${a.name} → ${b.name}` : 'Relation',
      }
    }

    return null
  }, [payload])

  return (
    <div className="h-[calc(100vh-88px)] w-full" ref={containerRef}>
      {/* Top overlay */}
      <div className="pointer-events-none absolute left-6 top-24 z-10 flex flex-col gap-3">
        <div className="pointer-events-auto w-[340px] rounded-xl border border-slate-700/50 bg-slate-950/60 backdrop-blur px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="game-icons:mesh-network" className="h-5 w-5 text-amber-400" />
              <span className="font-cinzel text-slate-100 tracking-wide">Relationship Graph</span>
            </div>
            <div className="text-xs text-slate-300">Wheel: zoom · Drag: pan</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {legend.map((l) => (
              <div key={l.type} className="flex items-center gap-2 text-sm text-slate-200">
                <span className="h-3 w-3 rounded-full" style={{ background: l.color }} />
                <span className="opacity-90">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {hoverLabel ? (
          <div className="pointer-events-none w-[340px] rounded-xl border border-amber-500/20 bg-slate-950/70 px-4 py-3 shadow-xl">
            <div className="text-sm font-semibold text-slate-100">{hoverLabel.title}</div>
            <div className="text-xs text-slate-300 mt-1">{hoverLabel.subtitle}</div>
          </div>
        ) : null}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Loading/Error */}
      {!payload && !error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-slate-200 shadow-xl">
            <Icon icon="game-icons:hourglass" className="h-5 w-5 text-amber-400" />
            <span>Loading graph…</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-500/30 bg-slate-950/70 px-5 py-4 text-slate-200 shadow-xl">
            <div className="flex items-center gap-2 text-red-300 font-semibold">
              <Icon icon="game-icons:warning" className="h-5 w-5" />
              <span>Failed to load graph</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{error}</p>
            <p className="mt-3 text-xs text-slate-400">Check DATABASE_URL and server logs.</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
