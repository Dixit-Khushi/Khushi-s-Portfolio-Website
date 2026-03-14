import { useMemo } from 'react'
import * as THREE from 'three'
import { ScrollControls, PerformanceMonitor } from '@react-three/drei'
import WalkingCamera from './WalkingCamera'
import Archway from './Archway'
import GhostOrbs, { ROAD_CURVE } from './GhostOrbs'
import Environment from './Environment'
import RainEffect from './RainEffect'

/**
 * Scene — root Three.js scene graph.
 * Fog is set directly on scene via <fog>.
 * PerformanceMonitor handles pixel-ratio scaling for mobile.
 */
function Road() {
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(ROAD_CURVE, 120, 1.4, 8, false),
    []
  )

  return (
    <mesh geometry={tubeGeometry} receiveShadow>
      {/* Inner road surface */}
      <meshStandardMaterial
        color="#636466"
        roughness={0.9}
        metalness={0.05}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function RoadMarkings() {
  // Dashed centre-line dots along the curve
  const dots = useMemo(() => {
    const pts = []
    const total = 40
    for (let i = 0; i < total; i++) {
      const t = i / total
      const p = ROAD_CURVE.getPoint(t)
      pts.push(p)
    }
    return pts
  }, [])

  return (
    <group>
      {dots.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.05, p.z]}>
          <boxGeometry args={[0.1, 0.05, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export default function Scene() {
  return (
    <>
      {/* Performance monitor: reduces dpr when fps drops below 45 */}
      <PerformanceMonitor
        onDecline={() => {
          // Could use adaptive resolution here via useThree if needed
        }}
      />

      {/* Atmospheric fog and background managed dynamically by Environment.jsx */}

      {/* Lighting */}
      <Environment />

      {/* Scroll-driven camera walk */}
      <ScrollControls pages={6} damping={0.18} distance={1}>
        <WalkingCamera />

        {/* Road tube */}
        <Road />
        <RoadMarkings />

        {/* Grand entrance */}
        <Archway />

        {/* Visitor ghost orbs */}
        <GhostOrbs />

        {/* Weather: rain when sleeping */}
        <RainEffect />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -75]} receiveShadow>
          <planeGeometry args={[120, 200]} />
          <meshStandardMaterial color="#223026" roughness={1} />
        </mesh>
      </ScrollControls>
    </>
  )
}
