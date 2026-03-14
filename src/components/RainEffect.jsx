import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'

/**
 * Rain particle effect — only visible when khushiStatus === 'sleeping'.
 * Uses <Points> with 500 particles falling downward.
 */
const PARTICLE_COUNT = 500
const SPREAD = 30
const HEIGHT = 20
const FALL_SPEED = 0.08

export default function RainEffect() {
  const { khushiStatus } = useStore()
  const pointsRef = useRef()

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * SPREAD
      pos[i * 3 + 1] = Math.random() * HEIGHT
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD - 60 // center at mid-path
      vel[i]         = FALL_SPEED + Math.random() * 0.05
    }
    return [pos, vel]
  }, [])

  useFrame(() => {
    if (!pointsRef.current || khushiStatus !== 'sleeping') return
    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] -= velocities[i]
      // Reset to top when below ground
      if (pos[i * 3 + 1] < -2) {
        pos[i * 3 + 1] = HEIGHT
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (khushiStatus !== 'sleeping') return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#aaddff"
        size={0.06}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
