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
import Surroundings from './Surroundings'

/**
 * SplineRoad — High-fidelity cobblestone path following ROAD_CURVE.
 * Extends the full length of the 4-phase journey.
 */
function SplineRoad() {
  const segments = 80
  const roadWidth = 4.8
  const curbWidth = 0.25
  const curbHeight = 0.10

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
      uvs.push(0, t, 1, t)
      if (i < segments) {
        const a = i*2, b = i*2+1, c = (i+1)*2, d = (i+1)*2+1
        // Fixed winding order: a,c,b ensures normal points UP instead of DOWN
        indices.push(a,c,b, b,c,d)
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
    const W = 512, H = 512
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    // Dark mortar/grout between stones
    ctx.fillStyle = '#4a4540'
    ctx.fillRect(0, 0, W, H)

    // Draw individual cobblestones in offset brick pattern
    const sW = 36, sH = 22
    const rows = Math.ceil(H / sH) + 2
    const cols = Math.ceil(W / sW) + 2
    const pad = 3

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetX = (r % 2) * (sW / 2)
        // Add pseudo-random jitter to make it look like natural irregular cobblestones
        const seed = (r * 31 + c * 17) & 0xff
        const jitterX = (seed % 5) - 2
        const jitterY = ((seed * 7) % 5) - 2

        const x = c * sW - offsetX + jitterX
        const y = r * sH + jitterY

        // Grey colour variations for realistic stone
        const lBase = 40 + (seed % 22)   // 40–62 % lightness
        const saturation = (seed % 5)    // slight tint
        const hue = 210                  // slightly cool grey

        // Stone face
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lBase}%)`
        const bx = x + pad, by = y + pad
        const bw = sW - pad * 2, bh = sH - pad * 2
        const rx = 4  // corner radius
        ctx.beginPath()
        ctx.moveTo(bx + rx, by)
        ctx.lineTo(bx + bw - rx, by)
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + rx)
        ctx.lineTo(bx + bw, by + bh - rx)
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - rx, by + bh)
        ctx.lineTo(bx + rx, by + bh)
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - rx)
        ctx.lineTo(bx, by + rx)
        ctx.quadraticCurveTo(bx, by, bx + rx, by)
        ctx.closePath()
        ctx.fill()

        // Top highlight
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lBase + 15}%)`
        ctx.fillRect(bx + rx, by + 1, bw - rx * 2, 3)

        // Bottom shadow
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lBase - 15}%)`
        ctx.fillRect(bx + rx, by + bh - 3, bw - rx * 2, 3)
      }
    }

    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 18)  // 2 across road width, 18 along length = nicely sized stones
    t.anisotropy = 16    // CRITICAL: prevents texture blurring into a solid color at grazing camera angles
    t.colorSpace = THREE.SRGBColorSpace // Ensure correct colors
    t.needsUpdate = true
    return t
  }, [])

  return (
    <group position={[0, 0.05, 0]}>
      <mesh geometry={roadGeom} receiveShadow>
        <meshStandardMaterial map={roadTex} roughness={0.88} metalness={0.0} color="#ffffff" />
      </mesh>
      <mesh geometry={curbGeom} castShadow receiveShadow>
        <meshStandardMaterial color="#8a7a6a" roughness={0.95} />
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
      <planeGeometry ref={geomRef} args={[300, 300, 32, 32]} />
      <meshStandardMaterial color="#4a8c34" roughness={0.95} />
    </mesh>
  )
}

/** Low-poly stylised trees along the Career Avenue */
function TreeRow({ side = 1 }) {
  // Phase 1 entrance + Phase 2 career avenue + Phase 3 approach
  const positions = [-6, -12, -18, -28, -36, -46, -56, -66, -76, -90, -104]
  const colors = [
    ['#2a5a2a','#1e4a1e'], // dusk dark greens (Phase 1)
    ['#2a5a2a','#1e4a1e'],
    ['#2a5a2a','#1e4a1e'],
    ['#2d6e2d','#1e5a1e'], // brighter (Phase 2)
    ['#2d6e2d','#256025'],
    ['#1e5a1e','#2d6e2d'],
    ['#2d6e2d','#256025'],
    ['#1e5a1e','#2d6e2d'],
    ['#2d6e2d','#1e5a1e'],
    ['#1a3d1a','#0f2d0f'], // dark night (Phase 3)
    ['#1a3d1a','#0f2d0f'],
  ]
  return (
    <group>
      {positions.map((z, i) => (
        <group key={i} position={[side * (6 + (i % 2) * 1.5), 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.28, 3, 6]} />
            <meshStandardMaterial color="#3E2010" roughness={0.9} />
          </mesh>
          {/* Bottom canopy */}
          <mesh position={[0, 3.8, 0]} castShadow>
            <coneGeometry args={[1.5, 3, 6]} />
            <meshStandardMaterial color={colors[i][0]} roughness={0.85} />
          </mesh>
          {/* Top canopy */}
          <mesh position={[0, 5.2, 0]} castShadow>
            <coneGeometry args={[1.0, 2.5, 6]} />
            <meshStandardMaterial color={colors[i][1]} roughness={0.85} />
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

      <ScrollControls pages={8} damping={0.18} distance={1}>
        {/* Environment must be inside ScrollControls so useScroll() works */}
        <Environment />

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

        {/* ── Rich surroundings across all phases ─────────── */}
        <Surroundings />

        <SocialSignpost position={[ 5.5, 0, -30]} rotation={[0, -0.5, 0]} />
        <SocialSignpost position={[-5.5, 0, -44]} rotation={[0,  0.5, 0]} />

        <SkillCrystal position={[ 5.5, 2.5, -35]} color="#00d8ff" iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" delay={0} />
        <SkillCrystal position={[-5.5, 2.5, -48]} color="#f7df1e" iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" delay={1} />
        <SkillCrystal position={[ 6,   2.5, -60]} color="#e34f26" iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" delay={2} />
        <SkillCrystal position={[-5.5, 2.5, -72]} color="#1572b6" iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" delay={3} />
        <SkillCrystal position={[ 5.5, 2.5, -85]} color="#339933" iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" delay={4} />

        {/* ── Phase 3: THE SANCTUARY (lake, swing, bottles) ─ */}
        <LakeScene baseZ={-108} />

        {/* ── Phase 4: THE ZERO-G CAFÉ ───────────────────── */}
        <ZeroGCafe baseZ={-150} />

      </ScrollControls>

      {/* Cinematic Bloom — disabled to prevent WebGL shader issues */}
      {/* <EffectComposer>
        <Bloom mipmapBlur intensity={1.8} luminanceThreshold={0.35} luminanceSmoothing={0.4} />
      </EffectComposer> */}
    </>
  )
}
