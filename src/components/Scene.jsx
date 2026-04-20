import { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ScrollControls, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import WalkingCamera from './WalkingCamera'
import Archway from './Archway'
import GhostOrbs, { ROAD_CURVE } from './GhostOrbs'
import Environment from './Environment'
import RainEffect from './RainEffect'
import SkillCrystal from './SkillCrystal'
import SocialSignpost from './SocialSignpost'
import SkillsOverlay from './SkillsOverlay'
import LakeScene from './LakeScene'
import ZeroGCafe from './ZeroGCafe'

/**
 * SplineRoad — High-fidelity cobblestone path following ROAD_CURVE.
 * Extends the full length of the 4-phase journey.
 */
function SplineRoad() {
  const segments = 180
  const roadWidth = 4.8
  const curbWidth = 0.3
  const curbHeight = 0.25

  const roadGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = [], indices = [], uvs = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point   = ROAD_CURVE.getPoint(t)
      const tangent = ROAD_CURVE.getTangent(t).normalize()
      const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize()
      const left  = point.clone().add(side.clone().multiplyScalar( roadWidth / 2))
      const right = point.clone().add(side.clone().multiplyScalar(-roadWidth / 2))
      vertices.push(left.x, left.y, left.z, right.x, right.y, right.z)
      uvs.push(0, t * 70, 1, t * 70)
      if (i < segments) {
        const a = i*2, b = i*2+1, c = (i+1)*2, d = (i+1)*2+1
        indices.push(a,b,c, b,d,c)
      }
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [])

  const curbGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const vertices = [], indices = []
    const buildCurb = (offset) => {
      const startIdx = vertices.length / 3
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const p = ROAD_CURVE.getPoint(t)
        const side = new THREE.Vector3().crossVectors(ROAD_CURVE.getTangent(t).normalize(), new THREE.Vector3(0,1,0)).normalize()
        const innerBase = p.clone().add(side.clone().multiplyScalar(offset))
        const outerBase = p.clone().add(side.clone().multiplyScalar(offset + (offset > 0 ? curbWidth : -curbWidth)))
        const innerTop  = innerBase.clone().add(new THREE.Vector3(0, curbHeight, 0))
        const outerTop  = outerBase.clone().add(new THREE.Vector3(0, curbHeight, 0))
        vertices.push(innerBase.x, innerBase.y, innerBase.z,
                      outerBase.x, outerBase.y, outerBase.z,
                      innerTop.x,  innerTop.y,  innerTop.z,
                      outerTop.x,  outerTop.y,  outerTop.z)
        if (i < segments) {
          const s = startIdx + i * 4
          indices.push(s+2,s+3,s+6, s+3,s+7,s+6, s,s+2,s+4, s+2,s+6,s+4, s+1,s+5,s+3, s+3,s+5,s+7)
        }
      }
    }
    buildCurb( roadWidth / 2)
    buildCurb(-roadWidth / 2)
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geom.setIndex(indices)
    geom.computeVertexNormals()
    return geom
  }, [])

  const roadTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(0, 0, 512, 512)
    ctx.strokeStyle = '#1a1a20'; ctx.lineWidth = 10
    const rows = 16, cols = 8, rH = 512/rows, cW = 512/cols
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r*rH); ctx.lineTo(512, r*rH); ctx.stroke()
      const off = (r % 2 === 0) ? 0 : cW/2
      for (let c = 0; c <= cols; c++) {
        const x = c*cW + off
        ctx.beginPath(); ctx.moveTo(x, r*rH); ctx.lineTo(x, (r+1)*rH); ctx.stroke()
      }
    }
    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 80)
    return t
  }, [])

  return (
    <group position={[0, 0.1, 0]}>
      <mesh geometry={roadGeom} receiveShadow>
        <meshStandardMaterial map={roadTex} roughness={0.8} metalness={0.1} />
      </mesh>
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
      const x = pos.getX(i), y = pos.getY(i)
      const z = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 4.0 + Math.sin(x * 0.01) * 3.0
      const flattenFactor = THREE.MathUtils.smoothstep(Math.abs(x), 4, 15)
      pos.setZ(i, z * flattenFactor)
    }
    geomRef.current.computeVertexNormals()
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, -75]} receiveShadow>
      <planeGeometry ref={geomRef} args={[600, 600, 64, 64]} />
      <meshBasicMaterial color="#3A5F2B" />
    </mesh>
  )
}

/** Low-poly stylised trees along the Career Avenue */
function TreeRow({ side = 1 }) {
  const positions = [-28, -38, -48, -58, -68, -78]
  return (
    <group>
      {positions.map((z, i) => (
        <group key={i} position={[side * (6 + (i % 2) * 1.5), 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 3, 6]} />
            <meshStandardMaterial color="#3E2010" roughness={0.9} />
          </mesh>
          {/* Canopy — low-poly */}
          <mesh position={[0, 3.8, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2d6e2d' : '#1e5a1e'} roughness={0.85} />
          </mesh>
          <mesh position={[0, 5.2, 0]} castShadow>
            <coneGeometry args={[1.0, 2.5, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#3a843a' : '#256025'} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function Scene() {
  return (
    <>
      <SkillsOverlay />

      <PerformanceMonitor onDecline={() => {}} />

      <Environment />

      <ScrollControls pages={8} damping={0.18} distance={1}>
        <WalkingCamera />

        {/* ── Phase 1: THE THRESHOLD ──────────────────────── */}
        <SplineRoad />
        <Archway />
        <GhostOrbs />
        <RainEffect />
        <RollingHills />

        {/* ── Phase 2: CAREER AVENUE ──────────────────────── */}
        <TreeRow side={1} />
        <TreeRow side={-1} />

        <SocialSignpost position={[ 4, 0.2, -28]} rotation={[0, -0.4, 0]} />
        <SocialSignpost position={[-4, 0.2, -42]} rotation={[0,  0.3, 0]} />

        <SkillCrystal position={[ 5, 1.5, -35]} color="#00e5ff" tooltipText="Python & Machine Learning" delay={0} />
        <SkillCrystal position={[-4, 1.5, -48]} color="#0055ff" tooltipText="C++ & Data Structures"     delay={1} />
        <SkillCrystal position={[ 6, 1.5, -60]} color="#aa00ff" tooltipText="AI / Computer Vision"      delay={2} />
        <SkillCrystal position={[-5, 1.5, -72]} color="#00ff55" tooltipText="React & Web Dev"           delay={3} />
        <SkillCrystal position={[ 5, 1.5, -85]} color="#ffdd00" tooltipText="Flask & SQLAlchemy"        delay={4} />

        {/* ── Phase 3: THE SANCTUARY (lake, swing, bottles) ─ */}
        <LakeScene baseZ={-108} />

        {/* ── Phase 4: THE ZERO-G CAFÉ ───────────────────── */}
        <ZeroGCafe baseZ={-150} />

      </ScrollControls>

      {/* Cinematic Bloom */}
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.8} luminanceThreshold={0.35} luminanceSmoothing={0.4} />
      </EffectComposer>
    </>
  )
}
