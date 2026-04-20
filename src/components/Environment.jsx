import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import useStore from '../store/useStore'
import * as THREE from 'three'

/**
 * Environment — dynamically blends fog + lighting across 4 phases:
 *   Phase 1 (0–25%)   : Dusk   — purple-grey sky, torch warmth
 *   Phase 2 (25–55%)  : Day    — bright blue sky, white sun
 *   Phase 3 (55–80%)  : Night  — dark navy, moonlight blue
 *   Phase 4 (80–100%) : Café   — warm amber interior
 *
 * khushiStatus from Bio-Sync can still override Phase 1 look.
 */

const PHASE_CONFIGS = [
  // Phase 1 — Dusk (entrance)
  {
    bgColor:          '#2A1B3D',
    ambientColor:     '#c8a0e0',
    ambientIntensity:  0.9,
    dirColor:         '#ff9944',
    dirIntensity:      1.4,
    fogColor:         '#2A1B3D',
    fogNear:           12,
    fogFar:            55,
  },
  // Phase 2 — Daytime (career avenue)
  {
    bgColor:          '#6ec6f5',
    ambientColor:     '#ffffff',
    ambientIntensity:  2.2,
    dirColor:         '#fffbe8',
    dirIntensity:      3.0,
    fogColor:         '#9ed8f8',
    fogNear:           20,
    fogFar:            110,
  },
  // Phase 3 — Night (lake sanctuary)
  {
    bgColor:          '#05091a',
    ambientColor:     '#2233aa',
    ambientIntensity:  0.6,
    dirColor:         '#4466cc',
    dirIntensity:      0.8,
    fogColor:         '#050914',
    fogNear:           10,
    fogFar:            80,
  },
  // Phase 4 — Café interior
  {
    bgColor:          '#0f0805',
    ambientColor:     '#ffcc88',
    ambientIntensity:  1.1,
    dirColor:         '#ff9944',
    dirIntensity:      0.5,
    fogColor:         '#0f0805',
    fogNear:           5,
    fogFar:            45,
  },
]

function lerp(a, b, t) { return a + (b - a) * t }

function getPhaseConfig(scrollT) {
  // Phase boundaries (scroll 0→1)
  const boundaries = [0, 0.25, 0.55, 0.80, 1.0]
  for (let i = 0; i < PHASE_CONFIGS.length; i++) {
    const start = boundaries[i]
    const end   = boundaries[i + 1]
    if (scrollT <= end) {
      const t = (scrollT - start) / (end - start)
      // Smooth interpolation between this phase and next phase
      const curr = PHASE_CONFIGS[i]
      const next = PHASE_CONFIGS[Math.min(i + 1, PHASE_CONFIGS.length - 1)]
      const st = Math.max(0, Math.min(1, t))
      return {
        bgColor:          lerpColor(curr.bgColor, next.bgColor, st),
        ambientColor:     lerpColor(curr.ambientColor, next.ambientColor, st),
        ambientIntensity: lerp(curr.ambientIntensity, next.ambientIntensity, st),
        dirColor:         lerpColor(curr.dirColor, next.dirColor, st),
        dirIntensity:     lerp(curr.dirIntensity, next.dirIntensity, st),
        fogColor:         lerpColor(curr.fogColor, next.fogColor, st),
        fogNear:          lerp(curr.fogNear, next.fogNear, st),
        fogFar:           lerp(curr.fogFar, next.fogFar, st),
      }
    }
  }
  return PHASE_CONFIGS[PHASE_CONFIGS.length - 1]
}

function lerpColor(a, b, t) {
  const ca = new THREE.Color(a)
  const cb = new THREE.Color(b)
  return '#' + ca.clone().lerp(cb, t).getHexString()
}

export default function Environment() {
  const scroll = useScroll()
  const ambRef = useRef()
  const dirRef = useRef()

  useFrame(({ scene }) => {
    if (!ambRef.current || !dirRef.current) return

    const raw = scroll?.offset ?? 0
    const phaseTarget = getPhaseConfig(raw)

    // Smooth lerp toward target
    const s = 0.035
    ambRef.current.color.lerp(new THREE.Color(phaseTarget.ambientColor), s)
    ambRef.current.intensity += (phaseTarget.ambientIntensity - ambRef.current.intensity) * s

    dirRef.current.color.lerp(new THREE.Color(phaseTarget.dirColor), s)
    dirRef.current.intensity += (phaseTarget.dirIntensity - dirRef.current.intensity) * s

    if (!scene.background) scene.background = new THREE.Color(PHASE_CONFIGS[0].bgColor)
    scene.background.lerp(new THREE.Color(phaseTarget.bgColor), s)

    if (!scene.fog) scene.fog = new THREE.Fog(PHASE_CONFIGS[0].fogColor, PHASE_CONFIGS[0].fogNear, PHASE_CONFIGS[0].fogFar)
    scene.fog.color.lerp(new THREE.Color(phaseTarget.fogColor), s)
    scene.fog.near += (phaseTarget.fogNear - scene.fog.near) * s
    scene.fog.far  += (phaseTarget.fogFar  - scene.fog.far)  * s
  })

  return (
    <>
      <ambientLight ref={ambRef} color={PHASE_CONFIGS[0].ambientColor} intensity={PHASE_CONFIGS[0].ambientIntensity} />
      <directionalLight
        ref={dirRef}
        color={PHASE_CONFIGS[0].dirColor}
        intensity={PHASE_CONFIGS[0].dirIntensity}
        position={[15, 28, 10]}
        castShadow={false}
      />
      {/* Warm entrance torch fill */}
      <pointLight position={[0, 8, -14]} intensity={2.5} color="#ff9944" distance={25} decay={2} />
    </>
  )
}
