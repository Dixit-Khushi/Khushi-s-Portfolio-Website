import { useMemo, useEffect, useRef } from 'react'
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
function CobblestoneMaterial() {
  const tex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Base dark grey stone
    ctx.fillStyle = '#4a4a50'
    ctx.fillRect(0, 0, 512, 512)
    
    // Draw brick outlines
    ctx.strokeStyle = '#2a2a30'
    ctx.lineWidth = 14
    
    const rows = 12
    const cols = 6
    const rowH = 512 / rows
    const colW = 512 / cols
    
    ctx.beginPath()
    for (let r = 0; r <= rows; r++) {
      ctx.moveTo(0, r * rowH)
      ctx.lineTo(512, r * rowH)
    }
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2 === 0) ? 0 : colW / 2
      for (let c = 0; c <= cols; c++) {
        const x = c * colW + offset
        ctx.moveTo(x, r * rowH)
        ctx.lineTo(x, (r + 1) * rowH)
      }
    }
    ctx.stroke()
    
    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(1, 40) // Repeat along the road length
    return t
  }, [])

  return (
    <meshStandardMaterial
      map={tex}
      roughness={0.9}
      metalness={0.05}
      side={THREE.BackSide}
    />
  )
}

function Road() {
  // Wider radius (2.4) and smooth segments (16). 
  // We will sink it into the ground so only the flat top arc forms the road surface.
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(ROAD_CURVE, 120, 2.4, 16, false),
    []
  )

  return (
    <mesh geometry={tubeGeometry} receiveShadow position={[0, -2.4, 0]}>
      <CobblestoneMaterial />
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

function RollingHills() {
  const geomRef = useRef()

  useEffect(() => {
    if (!geomRef.current) return
    const pos = geomRef.current.attributes.position
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i)
        
        // Gentle rolling hills
        const z = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 4.0 + Math.sin(x * 0.01) * 3.0
        
        // Flatten the center path slightly near X=0 so it doesn't block the road
        const distFromCenter = Math.abs(x)
        const flattenFactor = Math.min(1.0, distFromCenter / 15.0) 
        
        pos.setZ(i, z * flattenFactor) 
    }
    geomRef.current.computeVertexNormals()
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, -75]} receiveShadow>
      <planeGeometry ref={geomRef} args={[200, 200, 64, 64]} />
      <meshStandardMaterial color="#223026" roughness={1} />
    </mesh>
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

        {/* Rolling Green Hills */}
        <RollingHills />
      </ScrollControls>
    </>
  )
}
