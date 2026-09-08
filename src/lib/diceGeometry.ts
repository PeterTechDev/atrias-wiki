import * as THREE from 'three'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js'
import type { DieSides } from './dice'

// One shared hull for rendering, face labels, physics and result detection.
export function diceGeometry(sides: DieSides) {
  let source: THREE.BufferGeometry
  if (sides === 10) {
    const h = (1 - Math.cos(Math.PI / 5)) / (1 + Math.cos(Math.PI / 5))
    const points = Array.from({ length: 10 }, (_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 5), (i % 2 ? -1 : 1) * h, Math.sin(i * Math.PI / 5)))
    points.push(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0))
    source = new ConvexGeometry(points)
  } else {
    source = sides === 4 ? new THREE.TetrahedronGeometry(1)
      : sides === 6 ? new THREE.BoxGeometry(1.4, 1.4, 1.4)
        : sides === 8 ? new THREE.OctahedronGeometry(1)
          : sides === 12 ? new THREE.DodecahedronGeometry(1) : new THREE.IcosahedronGeometry(1)
  }
  if (source.index) {
    const original = source
    source = source.toNonIndexed()
    original.dispose()
  }
  source.scale(1.18, 1.18, 1.18)
  const positions = source.getAttribute('position')
  const vertices: THREE.Vector3[] = []
  const faces: { normal: THREE.Vector3; indices: number[]; center: THREE.Vector3; value: number }[] = []
  for (let i = 0; i < positions.count; i += 3) {
    const triangle = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(positions, i + j))
    const normal = triangle[1].clone().sub(triangle[0]).cross(triangle[2].clone().sub(triangle[0])).normalize()
    let face = faces.find(f => f.normal.dot(normal) > 0.99999)
    if (!face) { face = { normal, indices: [], center: new THREE.Vector3(), value: 0 }; faces.push(face) }
    for (const point of triangle) {
      let index = vertices.findIndex(v => v.distanceToSquared(point) < 0.000001)
      if (index < 0) { index = vertices.length; vertices.push(point) }
      if (!face.indices.includes(index)) face.indices.push(index)
    }
  }
  source.dispose()
  const assigned = new Set<number>()
  for (const face of faces) {
    face.center = face.indices.reduce((center, i) => center.add(vertices[i]), new THREE.Vector3()).divideScalar(face.indices.length)
    const x = vertices[face.indices[0]].clone().sub(face.center).normalize()
    const y = face.normal.clone().cross(x)
    face.indices.sort((a, b) => {
      const va = vertices[a].clone().sub(face.center), vb = vertices[b].clone().sub(face.center)
      return Math.atan2(va.dot(y), va.dot(x)) - Math.atan2(vb.dot(y), vb.dot(x))
    })
    if (!face.value) {
      const value = Array.from({ length: sides }, (_, i) => i + 1).find(v => !assigned.has(v))!
      face.value = value; assigned.add(value)
      const opposite = faces.find(f => !f.value && f.normal.dot(face.normal) < -0.99999)
      if (opposite) { opposite.value = sides + 1 - value; assigned.add(opposite.value) }
    }
  }
  const coordinates: number[] = []
  const uvs: number[] = []
  const geometry = new THREE.BufferGeometry()
  for (const [materialIndex, face] of faces.entries()) {
    const rotation = new THREE.Quaternion().setFromUnitVectors(face.normal, new THREE.Vector3(0, 0, 1))
    const local = face.indices.map(i => vertices[i].clone().sub(face.center).applyQuaternion(rotation))
    const extent = Math.max(...local.flatMap(v => [Math.abs(v.x), Math.abs(v.y)])) * 2.15
    const start = coordinates.length / 3
    for (let i = 1; i < face.indices.length - 1; i++) {
      for (const j of [0, i, i + 1]) {
        coordinates.push(...vertices[face.indices[j]].toArray())
        uvs.push(local[j].x / extent + 0.5, local[j].y / extent + 0.5)
      }
    }
    geometry.addGroup(start, coordinates.length / 3 - start, materialIndex)
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(coordinates, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  return { geometry, vertices, faces }
}

export function upwardFace(faces: ReturnType<typeof diceGeometry>['faces'], quaternion: THREE.Quaternion, sides: DieSides) {
  const candidates = faces.map(face => ({ value: face.value, alignment: face.normal.clone().applyQuaternion(quaternion).y * (sides === 4 ? -1 : 1) }))
  candidates.sort((a, b) => b.alignment - a.alignment)
  // A tilted but stable die is readable when one face clearly wins over its neighbor.
  return { ...candidates[0], readable: candidates[0].alignment - candidates[1].alignment > 0.08 }
}
