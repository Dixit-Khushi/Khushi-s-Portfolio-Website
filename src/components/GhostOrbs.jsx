import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Ghost Orbs — 6 glowing visitor orbs drifting along Phase 1 entrance path only.
 * ROAD_CURVE is the shared module-level singleton used by WalkingCamera too —
 * it now spans all 4 phases (z: 0 → -165).
 */

export const ROAD_CURVE = new THREE.CatmullRomCurve3([
  // Phase 1: The Threshold (entrance, dusk)
  new THREE.Vector3(  0,  0,    0),
  new THREE.Vector3(  0,  0,  -18),   // straight through the stone archway
  new THREE.Vector3(  3,  0.3, -28),

  // Phase 2: Career Avenue (daytime, skills)
  new THREE.Vector3( -3,  0.5, -40),
  new THREE.Vector3(  5,  0,   -55),
  new THREE.Vector3( -4,  0.5, -70),
  new THREE.Vector3(  4,  0,   -85),
  new THREE.Vector3( -2,  0.3, -96),

  // Phase 3: The Sanctuary (night, lake)
  new THREE.Vector3(  1,  0,  -108),
  new THREE.Vector3( -1,  0,  -122),
  new THREE.Vector3(  2,  0,  -135),

  // Phase 4: Zero-G Café (dawn interior)
  new THREE.Vector3(  0,  0.5,-148),
  new THREE.Vector3(  0,  1.2,-162),
  new THREE.Vector3(  0,  1.5,-168),
])

const ORB_COLORS = ['#00eeff', '#0077ff', '#aa00ff', '#00ffaa', '#ff66aa', '#ffaa00']

function GhostOrb({ index, color }) {
  const meshRef = useRef()
  // Each orb stays in Phase 1 range (t: 0 → 0.18)
  const baseT = useMemo(() => (index / ORB_COLORS.length) * 0.14, [index])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = (baseT + clock.elapsedTime * 0.008) % 0.18
    const pos = ROAD_CURVE.getPoint(t)
    const driftX = Math.sin(clock.elapsedTime * 0.5 + index * 1.3) * 1.6
    const driftY = Math.abs(Math.sin(clock.elapsedTime * 0.3 + index * 0.9)) * 1.0 + 0.3
    meshRef.current.position.set(pos.x + driftX, pos.y + driftY, pos.z)
    meshRef.current.position.y += Math.sin(clock.elapsedTime * 1.1 + index) * 0.12
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.14, 10, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        toneMapped={false}
        transparent
        opacity={0.88}
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
