import * as THREE from 'three'
import { Body, type ContactEquation } from 'cannon-es'

export function createContactFlames(scene: THREE.Scene, floor: Body, texture: THREE.Texture) {
  const particles = Array.from({ length: 192 }, () => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }))
    sprite.visible = false
    scene.add(sprite)
    return { sprite, age: 1, life: 0.4, size: 0.4, drift: 0 }
  })
  let elapsed = 0
  let emitted = new WeakMap<Body, number>()

  function clear() {
    particles.forEach(p => { p.sprite.visible = false })
    emitted = new WeakMap()
  }

  return {
    clear,
    update(dt: number, contacts: ContactEquation[], enabled: boolean) {
      elapsed += dt
      if (!enabled) { clear(); return false }
      for (const p of particles) {
        if (!p.sprite.visible) continue
        p.age += dt
        const progress = p.age / p.life
        p.sprite.visible = progress < 1
        p.sprite.material.opacity = 0.9 * Math.max(0, 1 - progress)
        p.sprite.position.x += p.drift * dt
        p.sprite.position.y += dt * 0.2
        p.sprite.position.z -= dt * 0.18
        p.sprite.scale.set(p.size * (1 - progress * 0.5), p.size * (1.4 + progress), 1)
      }
      for (const contact of contacts) {
        const body = contact.bi === floor ? contact.bj : contact.bj === floor ? contact.bi : null
        if (!body || body.sleepState === Body.SLEEPING || body.velocity.lengthSquared() + body.angularVelocity.lengthSquared() < 0.8) continue
        if (elapsed - (emitted.get(body) ?? -1) < 0.045) continue
        emitted.set(body, elapsed)
        // The floor-side contact stays on the surface, even during a bounce.
        const point = contact.bi === floor ? contact.ri : contact.rj
        for (let i = 0; i < 2; i++) {
          const p = particles.find(p => !p.sprite.visible)
          if (!p) break
          p.age = 0; p.life = 1.4 + Math.random() * 0.6
          p.size = 0.65 + Math.random() * 0.3; p.drift = (Math.random() - 0.5) * 0.2
          p.sprite.position.set(floor.position.x + point.x + (Math.random() - 0.5) * 0.12, 0.06, floor.position.z + point.z)
          p.sprite.scale.set(p.size, p.size * 1.4, 1)
          p.sprite.material.rotation = (Math.random() - 0.5) * 0.5
          p.sprite.material.opacity = 0.9; p.sprite.visible = true
        }
      }
      return particles.some(p => p.sprite.visible)
    },
    dispose() {
      particles.forEach(({ sprite }) => { scene.remove(sprite); sprite.material.dispose() })
      texture.dispose()
    },
  }
}
