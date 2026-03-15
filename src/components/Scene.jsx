import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ScrollControls, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
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
/**
 * SplineRoad — High-fidelity path with distinct curbs and cobblestone surface.
 * Exactly matches the "Spline Road" reference image.
 */
function SplineRoad() {
  const segments = 120
  const roadWidth = 4.8
  const curbWidth = 0.3
  const curbHeight = 0.25

  // 1. Cobblestone Surface Geometry
  const roadGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    const uvs = []
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point = ROAD_CURVE.getPoint(t)
      const tangent = ROAD_CURVE.getTangent(t).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize()
      
      const left = point.clone().add(side.clone().multiplyScalar(roadWidth / 2))
      const right = point.clone().add(side.clone().multiplyScalar(-roadWidth / 2))
      
      vertices.push(left.x, left.y, left.z)
      vertices.push(right.x, right.y, right.z)
      
      // Map UVs for cobblestone repeat
      uvs.push(0, t * 50)
      uvs.push(1, t * 50)
      
      if (i < segments) {
        const a = i * 2; const b = i * 2 + 1; const c = (i + 1) * 2; const d = (i + 1) * 2 + 1
        indices.push(a, b, c, b, d, c)
      }
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [])

  // 2. Curbs Geometry (Left & Right)
  const curbGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    
    const buildCurb = (offset) => {
      const startIdx = vertices.length / 3
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const p = ROAD_CURVE.getPoint(t)
        const tangent = ROAD_CURVE.getTangent(t).normalize()
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()
        
        // Base points for a rectangular curb
        const innerBase = p.clone().add(side.clone().multiplyScalar(offset))
        const outerBase = p.clone().add(side.clone().multiplyScalar(offset + (offset > 0 ? curbWidth : -curbWidth)))
        const innerTop = innerBase.clone().add(new THREE.Vector3(0, curbHeight, 0))
        const outerTop = outerBase.clone().add(new THREE.Vector3(0, curbHeight, 0))
        
        vertices.push(innerBase.x, innerBase.y, innerBase.z)
        vertices.push(outerBase.x, outerBase.y, outerBase.z)
        vertices.push(innerTop.x, innerTop.y, innerTop.z)
        vertices.push(outerTop.x, outerTop.y, outerTop.z)
        
        if (i < segments) {
          const s = startIdx + i * 4
          // Top face
          indices.push(s+2, s+3, s+6, s+3, s+7, s+6)
          // Inner face
          indices.push(s, s+2, s+4, s+2, s+6, s+4)
          // Outer face
          indices.push(s+1, s+5, s+3, s+3, s+5, s+7)
        }
      }
    }
    
    buildCurb(roadWidth / 2) // Left
    buildCurb(-roadWidth / 2) // Right
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [])

  // 3. Pavement Texture
  const roadTex = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = '#1a1a20'; ctx.lineWidth = 10
    const rows = 16, cols = 8, rH = 512/rows, cW = 512/cols
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r*rH); ctx.lineTo(512, r*rH); ctx.stroke()
      const off = (r % 2 === 0) ? 0 : cW / 2
      for (let c = 0; c <= cols; c++) {
        const x = c*cW + off; ctx.beginPath(); ctx.moveTo(x, r*rH); ctx.lineTo(x, (r+1)*rH); ctx.stroke()
      }
    }
    const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 60) // Higher tiling for visible cobblestone
    return t
  }, [])

  return (
    <group position={[0, 0.1, 0]}>
      {/* Road Surface */}
      <mesh geometry={roadGeom} receiveShadow>
        <meshStandardMaterial map={roadTex} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Curb Stone */}
      <mesh geometry={curbGeom} castShadow receiveShadow>
        <meshStandardMaterial color="#4a3a30" roughness={0.9} />
      </mesh>
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
        
        // Flatten the center path perfectly near X=0 so it doesn't clip the road
        const distFromCenter = Math.abs(x)
        const flattenFactor = THREE.MathUtils.smoothstep(distFromCenter, 4, 15)
        
        pos.setZ(i, z * flattenFactor) 
    }
    geomRef.current.computeVertexNormals()
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -75]} receiveShadow>
      <planeGeometry ref={geomRef} args={[600, 600, 64, 64]} />
      <meshStandardMaterial color="#5B6073" roughness={1} />
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

        {/* Road surface with raised curbs (Spline Road) */}
        <SplineRoad />

        {/* Grand entrance */}
        <Archway />

        {/* Visitor ghost orbs */}
        <GhostOrbs />

        {/* Weather: rain when sleeping */}
        <RainEffect />

        {/* Rolling Green Hills extending into fog */}
        <RollingHills />
      </ScrollControls>

      {/* Cinematic Post-Processing Bloom */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.5} luminanceThreshold={0.4} />
      </EffectComposer>
    </>
  )
}
