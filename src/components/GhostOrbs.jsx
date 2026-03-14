import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ghost Orbs — 8 glowing spheres drifting along the road curve,
 * simulating other concurrent visitors.
 */

// The same curve used in Scene — defined here as a module-level singleton
// so orbs can follow it without prop drilling.
export const ROAD_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,   0,    0),
  new THREE.Vector3(0,   0,  -16),  // Goes straight through the archway
  new THREE.Vector3(4,   0.5, -30),
  new THREE.Vector3(-3,  1,   -45),
  new THREE.Vector3(5,   0,   -65),
  new THREE.Vector3(-4,  0.5, -85),
  new THREE.Vector3(2,   1,  -105),
  new THREE.Vector3(-2,  0,  -125),
  new THREE.Vector3(0,   0,  -150),
])

const ORB_COUNT = 8
const ORB_COLORS = [
  '#00eeff', '#0077ff', '#aa00ff',
  '#00ffaa', '#ff66aa', '#ffaa00',
  '#33ffcc', '#ff44ff',
]

function GhostOrb({ index, color }) {
  const meshRef = useRef()
  // Each orb starts at a different t offset along the curve
  const baseT = useMemo(() => (index / ORB_COUNT) * 0.7, [index])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = (baseT + clock.elapsedTime * 0.012) % 1
    const pos = ROAD_CURVE.getPoint(t)
    // Gentle sine drift off to the sides
    const driftX = Math.sin(clock.elapsedTime * 0.5 + index * 1.3) * 1.8
    const driftY = Math.abs(Math.sin(clock.elapsedTime * 0.3 + index * 0.9)) * 1.2 + 0.4
    meshRef.current.position.set(pos.x + driftX, pos.y + driftY, pos.z)
    // Gentle bob
    meshRef.current.position.y += Math.sin(clock.elapsedTime * 1.1 + index) * 0.15
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 10, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3.5}
        toneMapped={false}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

export default function GhostOrbs() {
  return (
    <group>
      {ORB_COLORS.map((color, i) => (
        <GhostOrb key={i} index={i} color={color} />
      ))}
    </group>
  )
}
