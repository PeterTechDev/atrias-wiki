import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { diceGeometry, upwardFace } from '@/lib/diceGeometry'
import { DIE_SIDES, validCombination, type DicePool, type DiceResult, type DieSides } from '@/lib/dice'

export type DiceTheme = 'white-flame' | 'obsidian'
export type TableTheme = 'sanctuary' | 'tavern'
type Die = { mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial[]>; body: CANNON.Body; hull: ReturnType<typeof diceGeometry>; sides: DieSides }

function canvasTexture(paint: (ctx: CanvasRenderingContext2D) => void, size = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível preparar as texturas.')
  paint(ctx)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function paintMarble(ctx: CanvasRenderingContext2D, dark: boolean, size: number) {
  ctx.fillStyle = dark ? '#202c47' : '#e6dbc1'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 42; i++) {
    ctx.beginPath()
    for (let x = 0; x <= size; x += 4) {
      const y = (i * size / 22) - size / 2 + x * 0.65 + Math.sin(x / size * 9 + i * 1.3) * size * 0.07 + Math.sin(x / size * 27 + i) * size * 0.012
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = dark ? `rgba(132,161,203,${i % 3 ? 0.13 : 0.35})` : `rgba(135,111,70,${i % 3 ? 0.2 : 0.38})`
    ctx.lineWidth = i % 3 ? 1 : 2.5
    ctx.stroke()
  }
}

function faceTexture(hull: ReturnType<typeof diceGeometry>, faceIndex: number, sides: DieSides, theme: DiceTheme) {
  return canvasTexture(ctx => {
    const dark = theme === 'obsidian'
    paintMarble(ctx, dark, 256)
    ctx.fillStyle = dark ? '#fff0c6' : '#59401c'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const face = hull.faces[faceIndex]
    if (sides === 4) {
      const rotation = new THREE.Quaternion().setFromUnitVectors(face.normal, new THREE.Vector3(0, 0, 1))
      const local = face.indices.map(i => hull.vertices[i].clone().sub(face.center).applyQuaternion(rotation))
      const extent = Math.max(...local.flatMap(v => [Math.abs(v.x), Math.abs(v.y)])) * 2.15
      for (const [j, index] of face.indices.entries()) {
        const value = hull.faces.find(f => !f.indices.includes(index))!.value
        const position = local[j].clone().multiplyScalar(0.57 / extent * 256)
        ctx.save(); ctx.translate(128 + position.x, 128 - position.y)
        ctx.rotate(Math.atan2(-position.y, position.x) + Math.PI / 2)
        ctx.font = 'bold 48px Georgia'; ctx.fillText(String(value), 0, 0); ctx.restore()
      }
    } else {
      ctx.font = `bold ${sides >= 10 ? 83 : 104}px Georgia`
      ctx.fillText(String(face.value), 128, 132)
      if (face.value === 6 || face.value === 9) ctx.fillRect(113, 179, 30, 4)
    }
  })
}

function tableTexture(theme: TableTheme) {
  return canvasTexture(ctx => {
    const size = 1024
    if (theme === 'sanctuary') paintMarble(ctx, false, size)
    else {
      ctx.fillStyle = '#523526'; ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 480; i++) {
        const y = i * size / 480
        ctx.strokeStyle = `rgba(${i % 2 ? '22,11,6' : '192,140,83'},0.18)`
        ctx.beginPath(); ctx.moveTo(0, y)
        ctx.bezierCurveTo(320, y + Math.sin(i) * 30, 640, y - Math.cos(i) * 20, size, y)
        ctx.stroke()
      }
      for (let y = 0; y <= size; y += size / 5) { ctx.fillStyle = '#291c18'; ctx.fillRect(0, y, size, 4) }
    }
    ctx.strokeStyle = theme === 'sanctuary' ? '#927035bb' : '#d9b56c88'
    ctx.lineWidth = 2
    for (const radius of [270, 283, 370]) { ctx.beginPath(); ctx.arc(512, 512, radius, 0, Math.PI * 2); ctx.stroke() }
    for (let i = 0; i < 48; i++) {
      const a = i * Math.PI / 24
      ctx.beginPath(); ctx.moveTo(512 + Math.cos(a) * 290, 512 + Math.sin(a) * 290)
      ctx.lineTo(512 + Math.cos(a) * (i % 4 ? 300 : 320), 512 + Math.sin(a) * (i % 4 ? 300 : 320)); ctx.stroke()
    }
    // A white flame within a shield, engraved into the rolling surface.
    ctx.beginPath(); ctx.moveTo(422, 448); ctx.lineTo(512, 416); ctx.lineTo(602, 448)
    ctx.bezierCurveTo(602, 554, 567, 594, 512, 627)
    ctx.bezierCurveTo(457, 594, 422, 554, 422, 448); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(512, 567)
    ctx.bezierCurveTo(425, 532, 530, 483, 501, 454)
    ctx.bezierCurveTo(578, 507, 551, 539, 512, 567); ctx.stroke()
  }, 1024)
}

export function createDiceScene(host: HTMLDivElement, onError: (message: string) => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-10, 10, 8, -8, 0.1, 70)
  camera.position.set(0, 30, 0); camera.up.set(0, 0, -1); camera.lookAt(0, 0, 0)
  const environment = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environmentMap = pmrem.fromScene(environment)
  scene.environment = environmentMap.texture
  scene.environmentIntensity = 0.65
  environment.dispose(); pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xe6efff, 0x6e5736, 0.8))
  const light = new THREE.DirectionalLight(0xffefd1, 2.3)
  light.position.set(-6, 15, 6); light.castShadow = true
  light.shadow.mapSize.set(2048, 2048)
  Object.assign(light.shadow.camera, { left: -22, right: 22, top: 18, bottom: -18, far: 45 })
  light.shadow.normalBias = 0.035; light.shadow.bias = -0.0001
  light.shadow.camera.updateProjectionMatrix()
  scene.add(light)
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -32, 0), allowSleep: true })
  const material = new CANNON.Material('dice-table')
  world.addContactMaterial(new CANNON.ContactMaterial(material, material, { friction: 0.38, restitution: 0.36 }))
  const floorBody = new CANNON.Body({ mass: 0, material, shape: new CANNON.Plane() })
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floorBody)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: tableTexture('sanctuary'), roughness: 0.85, metalness: 0.08 }))
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
  const walls: CANNON.Body[] = []
  const rails: THREE.Mesh[] = []
  let dice: Die[] = [], width = 20, depth = 16, frame = 0, disposed = false
  let theme: DiceTheme = 'white-flame', table: TableTheme = 'sanctuary'
  let audio: AudioContext | undefined, sound = false, lastImpact = 0
  let active: { resolve: (dice: DiceResult[]) => void; reject: (error: Error) => void; elapsed: number; nudged: number } | null = null
  let lastTime = 0

  function render() { if (!disposed) renderer.render(scene, camera) }
  function clearDice() {
    const released = new Set<THREE.BufferGeometry>()
    for (const die of dice) {
      scene.remove(die.mesh); world.removeBody(die.body)
      if (!released.has(die.mesh.geometry)) {
        released.add(die.mesh.geometry); die.mesh.geometry.dispose()
        die.mesh.material.forEach(m => { m.map?.dispose(); m.dispose() })
      }
      for (const child of die.mesh.children) {
        if (child instanceof THREE.LineSegments) { child.geometry.dispose(); child.material.dispose() }
      }
    }
    dice = []
  }
  function impact(event: { contact: CANNON.ContactEquation }) {
    if (!sound || !audio || audio.state !== 'running' || performance.now() - lastImpact < 38) return
    const strength = Math.abs(event.contact.getImpactVelocityAlongNormal())
    if (strength < 1.5) return
    lastImpact = performance.now()
    const oscillator = audio.createOscillator(), gain = audio.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(table === 'tavern' ? 260 : 540, audio.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(85, audio.currentTime + 0.045)
    gain.gain.setValueAtTime(Math.min(strength / 100, 0.12), audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.075)
    oscillator.connect(gain); gain.connect(audio.destination)
    oscillator.start(); oscillator.stop(audio.currentTime + 0.08)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
  }
  function addDie(sides: DieSides) {
    const template = dice.find(die => die.sides === sides)
    const hull = template?.hull ?? diceGeometry(sides)
    const materials = template?.mesh.material ?? hull.faces.map((_, i) => new THREE.MeshStandardMaterial({ map: faceTexture(hull, i, sides, theme), roughness: theme === 'obsidian' ? 0.27 : 0.36, metalness: theme === 'obsidian' ? 0.4 : 0.05 }))
    const mesh = new THREE.Mesh(hull.geometry, materials)
    mesh.castShadow = mesh.receiveShadow = true
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(hull.geometry, 12), new THREE.LineBasicMaterial({ color: theme === 'obsidian' ? 0xd3b76d : 0xb29355, transparent: true, opacity: 0.7 })))
    scene.add(mesh)
    const body = new CANNON.Body({ mass: 1, material, shape: new CANNON.ConvexPolyhedron({ vertices: hull.vertices.map(v => new CANNON.Vec3(v.x, v.y, v.z)), faces: hull.faces.map(f => f.indices) }), linearDamping: 0.22, angularDamping: 0.23, sleepSpeedLimit: 0.18, sleepTimeLimit: 0.45 })
    body.addEventListener('collide', impact)
    world.addBody(body)
    const die = { mesh, body, hull, sides }; dice.push(die)
    return die
  }
  function resize() {
    const bounds = host.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return
    width = Math.max(12, 16 * bounds.width / bounds.height); depth = width * bounds.height / bounds.width
    camera.left = -width / 2; camera.right = width / 2; camera.top = depth / 2; camera.bottom = -depth / 2; camera.updateProjectionMatrix()
    renderer.setSize(bounds.width, bounds.height)
    floor.scale.set(width, depth, 1)
    walls.forEach(wall => world.removeBody(wall)); walls.length = 0
    rails.forEach(rail => { scene.remove(rail); rail.geometry.dispose(); (rail.material as THREE.Material).dispose() }); rails.length = 0
    for (const [x, z, sx, sz] of [[-width / 2, 0, 0.35, depth / 2], [width / 2, 0, 0.35, depth / 2], [0, -depth / 2, width / 2, 0.35], [0, depth / 2, width / 2, 0.35]]) {
      const wall = new CANNON.Body({ mass: 0, material, shape: new CANNON.Box(new CANNON.Vec3(sx, 7, sz)), position: new CANNON.Vec3(x, 7, z) })
      world.addBody(wall); walls.push(wall)
      const rail = new THREE.Mesh(new THREE.BoxGeometry(sx * 2, 0.6, sz * 2), new THREE.MeshStandardMaterial({ color: 0x9b804b, metalness: 0.6, roughness: 0.35 }))
      rail.position.set(x, 0.3, z); rail.receiveShadow = rail.castShadow = true; scene.add(rail); rails.push(rail)
    }
    for (const die of dice) {
      die.body.position.x = THREE.MathUtils.clamp(die.body.position.x, -width / 2 + 1.7, width / 2 - 1.7)
      die.body.position.z = THREE.MathUtils.clamp(die.body.position.z, -depth / 2 + 1.7, depth / 2 - 1.7)
      die.mesh.position.copy(die.body.position)
      if (active) die.body.wakeUp()
    }
    render()
  }
  function tick(time: number) {
    if (!active || disposed) return
    const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 0.05)
    lastTime = time; active.elapsed += dt
    world.step(1 / 60, dt, 4)
    for (const die of dice) { die.mesh.position.copy(die.body.position); die.mesh.quaternion.copy(die.body.quaternion) }
    render()
    const settled = dice.every(die => die.body.sleepState === CANNON.Body.SLEEPING)
    if (active.elapsed > 1.2 && settled) {
      const results = dice.map(die => upwardFace(die.hull.faces, die.mesh.quaternion, die.sides))
      if (results.every(result => result.readable)) {
        const { resolve } = active; active = null
        resolve(results.map((result, i) => ({ sides: dice[i].sides, value: result.value }))); return
      }
    }
    if (active.elapsed - active.nudged > 3 && (settled || active.elapsed > 6)) {
      active.nudged = active.elapsed
      // Unstick cocked/stacked dice through physics; never invent a face result.
      for (const die of dice) {
        if (!upwardFace(die.hull.faces, die.mesh.quaternion, die.sides).readable) {
          die.body.wakeUp()
          die.body.velocity.set(-die.body.position.x * 0.85 + (Math.random() - 0.5) * 4, 7, -die.body.position.z * 0.85 + (Math.random() - 0.5) * 4)
          die.body.angularVelocity.set(5, 3, 4)
        }
      }
    }
    if (active.elapsed > 18) { const { reject } = active; active = null; reject(new Error('Um dado ficou preso. Tente rolar novamente.')); return }
    frame = requestAnimationFrame(tick)
  }
  function preview(pool: DicePool) {
    if (active || disposed) return
    clearDice()
    const sides = DIE_SIDES.flatMap(sides => Array.from({ length: pool[sides] ?? 0 }, () => sides))
    const columns = Math.max(1, Math.min(sides.length, Math.floor((width - 2) / 2.6)))
    for (const [i, side] of sides.entries()) {
      const die = addDie(side)
      const rows = Math.ceil(sides.length / columns), rowSize = Math.min(columns, sides.length - Math.floor(i / columns) * columns)
      const spacing = Math.min(2.5, (depth - 3) / Math.max(1, rows - 1))
      die.body.position.set((i % columns - (rowSize - 1) / 2) * 2.6, 1.1, (Math.floor(i / columns) - (rows - 1) / 2) * spacing)
      const face = die.hull.faces.find(f => f.value === side)!
      die.mesh.quaternion.setFromUnitVectors(face.normal, new THREE.Vector3(0, side === 4 ? -1 : 1, 0))
      die.body.position.y = -Math.min(...die.hull.vertices.map(vertex => vertex.clone().applyQuaternion(die.mesh.quaternion).y)) + 0.02
      const { x, y, z, w } = die.mesh.quaternion
      die.body.quaternion.set(x, y, z, w); die.mesh.position.copy(die.body.position); die.body.sleep()
    }
    render()
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize()
  const contextLost = (event: Event) => {
    event.preventDefault(); cancelAnimationFrame(frame)
    if (active) { active.reject(new Error('A mesa 3D foi interrompida. Recarregue para tentar novamente.')); active = null }
    onError('A conexão com a mesa 3D foi perdida. Recarregue a página.')
  }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)

  return {
    preview,
    customize(nextTheme: DiceTheme, nextTable: TableTheme, pool: DicePool) {
      if (active) return
      theme = nextTheme
      if (table !== nextTable) { table = nextTable; floor.material.map?.dispose(); floor.material.map = tableTexture(table); floor.material.needsUpdate = true }
      preview(pool)
    },
    setSound(enabled: boolean) {
      sound = enabled
      if (enabled) { audio ??= new AudioContext(); void audio.resume().catch(() => { sound = false }) }
    },
    roll(pool: DicePool, force: number): Promise<DiceResult[]> {
      if (disposed || active || !validCombination({ pool, modifier: 0 })) return Promise.reject(new Error('Escolha os dados antes de rolar.'))
      clearDice()
      const power = THREE.MathUtils.clamp(force, 1, 3)
      let i = 0
      const columns = Math.max(2, Math.floor((width - 3) / 2.5))
      for (const sides of DIE_SIDES) for (let j = 0; j < (pool[sides] ?? 0); j++, i++) {
        const die = addDie(sides)
        die.body.position.set((i % columns - (columns - 1) / 2) * 2.3, 3 + Math.floor(i / columns) * 2.4, -depth / 2 + 2.5 + Math.random())
        die.body.quaternion.setFromEuler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
        die.body.velocity.set((Math.random() - 0.5) * (5 + power * 3), 0, 6 + power * 3 + Math.random() * 3)
        die.body.angularVelocity.set((Math.random() - 0.5) * 20 * power, (Math.random() - 0.5) * 20 * power, (Math.random() - 0.5) * 20 * power)
      }
      return new Promise((resolve, reject) => { active = { resolve, reject, elapsed: 0, nudged: 0 }; lastTime = performance.now(); frame = requestAnimationFrame(tick) })
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect()
      if (active) { active.reject(new Error('Mesa fechada.')); active = null }
      clearDice()
      rails.forEach(rail => { rail.geometry.dispose(); (rail.material as THREE.Material).dispose() })
      floor.geometry.dispose(); floor.material.map?.dispose(); floor.material.dispose()
      light.shadow.dispose(); environmentMap.dispose()
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
      void audio?.close()
    },
  }
}
