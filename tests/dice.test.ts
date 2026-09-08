import assert from 'node:assert/strict'
import { Quaternion, Vector3 } from 'three'
import { Body, ConvexPolyhedron, Material, ContactMaterial, Plane, Vec3, World } from 'cannon-es'
import { DIE_SIDES, diceCount, motionStrength, notation, parseNotation, readDiceStorage, validCombination } from '../src/lib/dice'
import { diceGeometry, upwardFace } from '../src/lib/diceGeometry'

const combination = parseNotation('2d6 + 4d8 - 3')
assert.deepEqual(combination, { pool: { 6: 2, 8: 4 }, modifier: -3 })
assert.equal(notation(combination), '2d6 + 4d8 − 3')
assert.equal(diceCount(combination.pool), 6)
assert.deepEqual(parseNotation('1D20+2d20+5'), { pool: { 20: 3 }, modifier: 5 })
for (const value of ['0d6', '25d6', '1d3', '1d6+1000', '1d6-1000', '1d6+2', '1d6-2']) {
  if (value === '1d6+2' || value === '1d6-2') assert.ok(validCombination(parseNotation(value)))
  else assert.throws(() => parseNotation(value))
}
for (const value of ['', 'd6', '2d6 - 1d4', '2d6+3.5', '2d6 trailing', '2d6+NaN']) assert.throws(() => parseNotation(value))
for (const value of [null, {}, { pool: { 7: 1 }, modifier: 0 }, { pool: { 6: 1.5 }, modifier: 0 }, { pool: { 6: 1 }, modifier: Infinity }]) assert.equal(validCombination(value), false)
assert.throws(() => readDiceStorage('{broken'))
assert.deepEqual(readDiceStorage(null), { favorites: [], history: [] })
const roll = { pool: { 6: 2 }, modifier: -3, id: 'test', at: new Date().toISOString(), dice: [{ sides: 6, value: 2 }, { sides: 6, value: 4 }], total: 3 }
assert.deepEqual(readDiceStorage(JSON.stringify({ history: [roll], favorites: [] })).history, [roll])
for (const bad of [{ ...roll, total: 7 }, { ...roll, at: 'bad' }, { ...roll, dice: [{ sides: 6, value: 7 }] }, { ...roll, pool: { 8: 2 } }]) assert.deepEqual(readDiceStorage(JSON.stringify({ history: [bad], favorites: [null] })), { history: [], favorites: [] })
assert.equal(motionStrength({ acceleration: null, accelerationIncludingGravity: { x: 0, y: 9.81, z: 0 }, rotationRate: null }), 0)
assert.equal(motionStrength({ acceleration: { x: 20, y: 0, z: 0 }, accelerationIncludingGravity: null, rotationRate: null }), 20)
assert.equal(motionStrength({ acceleration: { x: NaN, y: 0, z: 0 }, accelerationIncludingGravity: null, rotationRate: null }), 0)

for (const sides of DIE_SIDES) {
  const hull = diceGeometry(sides)
  assert.equal(hull.faces.length, sides, `d${sides} face count`)
  assert.equal(hull.vertices.length - hull.faces.reduce((sum, f) => sum + f.indices.length, 0) / 2 + hull.faces.length, 2, 'Closed convex hull')
  assert.deepEqual(hull.faces.map(f => f.value).sort((a, b) => a - b), Array.from({ length: sides }, (_, i) => i + 1))
  for (const face of hull.faces) {
    assert.ok(face.normal.dot(face.center) > 0, 'Outward face normal')
    for (const index of face.indices) assert.ok(Math.abs(hull.vertices[index].clone().sub(face.center).dot(face.normal)) < 0.00001, 'Coplanar face vertices')
    const quaternion = new Quaternion().setFromUnitVectors(face.normal, new Vector3(0, sides === 4 ? -1 : 1, 0))
    assert.equal(upwardFace(hull.faces, quaternion, sides).value, face.value, 'Displayed face matches detected value, including bottom-reading d4')
    assert.ok(upwardFace(hull.faces, quaternion, sides).readable)
    const neighbor = hull.faces.filter(other => other !== face).sort((a, b) => b.normal.dot(face.normal) - a.normal.dot(face.normal))[0]
    const edgeUp = new Quaternion().setFromUnitVectors(face.normal.clone().add(neighbor.normal).normalize(), new Vector3(0, sides === 4 ? -1 : 1, 0))
    assert.equal(upwardFace(hull.faces, edgeUp, sides).readable, false, 'A die balanced between two faces must be nudged, not scored')
    const opposite = hull.faces.find(other => other.normal.dot(face.normal) < -0.99999)
    if (opposite) assert.equal(face.value + opposite.value, sides + 1, 'Opposite faces have standard sums')
  }
  const material = new Material('test')
  const world = new World({ gravity: new Vec3(0, -32, 0), allowSleep: true })
  world.addContactMaterial(new ContactMaterial(material, material, { friction: 0.38, restitution: 0.36 }))
  const floor = new Body({ mass: 0, material, shape: new Plane() })
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(floor)
  const die = new Body({ mass: 1, material, shape: new ConvexPolyhedron({ vertices: hull.vertices.map(v => new Vec3(v.x, v.y, v.z)), faces: hull.faces.map(f => f.indices) }), linearDamping: 0.22, angularDamping: 0.23, sleepSpeedLimit: 0.18, sleepTimeLimit: 0.45 })
  die.position.set(0, 4, 0); die.quaternion.setFromEuler(0.43, 1.7, 0.81); die.angularVelocity.set(7, -4, 3); world.addBody(die)
  for (let step = 0; step < 1080 && die.sleepState !== Body.SLEEPING; step++) world.step(1 / 60)
  assert.equal(die.sleepState, Body.SLEEPING, `d${sides} comes to rest`)
  const result = upwardFace(hull.faces, new Quaternion(die.quaternion.x, die.quaternion.y, die.quaternion.z, die.quaternion.w), sides)
  assert.ok(result.alignment > 0.97, `d${sides} rests on a readable face`)
  hull.geometry.dispose()
}
console.log('Dice: notation, validation, storage integrity, motion, all six hulls and physical face detection passed.')
