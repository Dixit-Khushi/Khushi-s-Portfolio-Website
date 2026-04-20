import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Grand Stone Archway — matches the reference image exactly.
 * Thick rectangular stone pillars + curved semi-circular arch opening.
 * "KHUSHI'S WORLD" glows in cyan neon on the front face.
 */
export default function Archway() {
  const textMatRef = useRef()
  const glowRef = useRef()

  // Animate neon text pulse
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (textMatRef.current) {
      textMatRef.current.emissiveIntensity = 3.5 + Math.sin(t * 2.2) * 0.8
    }
    if (glowRef.current) {
      glowRef.current.opacity = 0.55 + Math.sin(t * 1.5) * 0.12
    }
  })

  // Stone block texture baked on canvas
  const stoneTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512; canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Base stone color — dark grey
    ctx.fillStyle = '#4a4a58'
    ctx.fillRect(0, 0, 512, 512)

    // Subtle noise variation
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const s = Math.random() * 4 + 1
      const lum = Math.floor(Math.random() * 30) + 60
      ctx.fillStyle = `rgb(${lum},${lum},${lum+8})`
      ctx.fillRect(x, y, s, s)
    }

    // Horizontal mortar lines
    ctx.strokeStyle = '#2a2a38'
    ctx.lineWidth = 4
    const blockH = 64
    for (let row = 0; row <= 512 / blockH; row++) {
      const y = row * blockH
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
    }
    // Vertical mortar — offset every other row
    const blockW = 80
    for (let row = 0; row <= 512 / blockH; row++) {
      const y = row * blockH
      const offset = (row % 2 === 0) ? 0 : blockW / 2
      for (let col = 0; col <= 512 / blockW + 1; col++) {
        const x = col * blockW + offset
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + blockH); ctx.stroke()
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 3)
    return tex
  }, [])

  // Stone material shared
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: stoneTex,
    color: '#5a5a6e',
    roughness: 0.95,
    metalness: 0.0,
  }), [stoneTex])

  // Shape for the arch top: a rectangle with a semicircular hole cut for the passage
  const archTopShape = useMemo(() => {
    const W = 14     // total width
    const H = 5      // height of the top block
    const archR = 4.2 // radius of the arch opening
    const shape = new THREE.Shape()
    shape.moveTo(-W / 2, 0)
    shape.lineTo( W / 2, 0)
    shape.lineTo( W / 2, H)
    shape.lineTo(-W / 2, H)
    shape.closePath()

    // Cut the semicircular arch opening
    const hole = new THREE.Path()
    hole.absarc(0, 0, archR, 0, Math.PI, false)
    shape.holes.push(hole)
    return shape
  }, [])

  const extrudeDepth = 4.2

  return (
    <group position={[0, 0, -16]}>

      {/* ── LEFT PILLAR ─────────────────────────────────────── */}
      <mesh position={[-5.5, 5.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 10.0, extrudeDepth]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── RIGHT PILLAR ────────────────────────────────────── */}
      <mesh position={[5.5, 5.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 10.0, extrudeDepth]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── ARCH TOP BLOCK (with rounded opening) ───────────── */}
      <mesh position={[0, 10.0, -extrudeDepth / 2]} castShadow receiveShadow>
        <extrudeGeometry args={[archTopShape, {
          depth: extrudeDepth,
          bevelEnabled: true,
          bevelSize: 0.18,
          bevelThickness: 0.18,
          bevelSegments: 2,
        }]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── LINTEL CAPSTONE on top ───────────────────────────── */}
      <mesh position={[0, 15.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[15.5, 0.9, extrudeDepth + 0.6]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── PILLAR CAP STONES ────────────────────────────────── */}
      <mesh position={[-5.5, 10.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.5, extrudeDepth + 0.4]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>
      <mesh position={[5.5, 10.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.5, extrudeDepth + 0.4]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── GROUND BASE SLABS ────────────────────────────────── */}
      <mesh position={[-5.5, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4, 0.22, extrudeDepth + 0.8]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>
      <mesh position={[5.5, 0.08, 0]} receiveShadow>
        <boxGeometry args={[4, 0.22, extrudeDepth + 0.8]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── TORCH / LANTERN — LEFT ───────────────────────────── */}
      <group position={[-5.5, 10.7, 1.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.55, 8]} />
          <meshStandardMaterial color="#2a2030" roughness={0.7} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} intensity={3.5} color="#ff9944" distance={12} decay={2} />
        {/* flame glow */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>

      {/* ── TORCH / LANTERN — RIGHT ──────────────────────────── */}
      <group position={[5.5, 10.7, 1.8]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.15, 0.55, 8]} />
          <meshStandardMaterial color="#2a2030" roughness={0.7} />
        </mesh>
        <pointLight position={[0, 0.5, 0]} intensity={3.5} color="#ff9944" distance={12} decay={2} />
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>

      {/* ── PORTAL GLOW (inside the arch tunnel) ─────────────── */}
      <mesh position={[0, 5.5, -0.5]}>
        <planeGeometry args={[8.2, 10.5]} />
        <meshBasicMaterial
          ref={glowRef}
          color="#7700cc"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 5.5, -0.6]}>
        <planeGeometry args={[9, 11.5]} />
        <meshBasicMaterial
          color="#3300aa"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── "KHUSHI'S WORLD" NEON TEXT ───────────────────────── */}
      <Text
        position={[0, 13.5, 2.3]}
        fontSize={1.45}
        letterSpacing={0.08}
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={textMatRef}
          color="#ffffff"
          emissive="#00e5ff"
          emissiveIntensity={3.5}
          toneMapped={false}
        />
      </Text>

      {/* Cyan point light to cast neon glow onto stone */}
      <pointLight position={[0, 13.5, 2.5]} intensity={8} color="#00e5ff" distance={18} decay={2} />
    </group>
  )
}
