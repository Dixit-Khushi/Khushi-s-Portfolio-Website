import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'

const PROJECTS = [
  {
    title: 'AI Vision System',
    desc: 'Real-time hand-gesture laptop control using MediaPipe & PyAutoGUI. Detects pinch, scroll, and cursor from a webcam feed.',
    color: '#00e5ff',
    icon: '🤖',
    link: 'https://github.com/Dixit-Khushi',
  },
  {
    title: 'Portfolio World',
    desc: 'This immersive 3D portfolio built with React Three Fiber — a 4-phase world you walk through with scroll & mouse.',
    color: '#aa00ff',
    icon: '🌐',
    link: 'https://github.com/Dixit-Khushi',
  },
  {
    title: 'Flask Form Manager',
    desc: 'Full-stack form system with Flask-WTF validation, SQLAlchemy ORM, and secure environment-based secret management.',
    color: '#00ff88',
    icon: '🧪',
    link: 'https://github.com/Dixit-Khushi',
  },
]

/** A floating holographic project bubble */
function ProjectBubble({ project, position, delay = 0 }) {
  const groupRef = useRef()
  const shellRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || !shellRef.current) return
    const t = clock.elapsedTime + delay
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.28
    groupRef.current.rotation.y += hovered ? 0.015 : 0.005
    shellRef.current.material.opacity = hovered ? 0.55 : 0.32
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
    >
      {/* Outer translucent bubble */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[1.05, 24, 24]} />
        <meshStandardMaterial
          color={project.color}
          roughness={0.0}
          metalness={0.2}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 3.5 : 1.8}
          roughness={0.1}
          metalness={0.7}
          transparent
          opacity={0.78}
          toneMapped={false}
        />
      </mesh>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.2, 0.04, 8, 64]} />
        <meshBasicMaterial color={project.color} toneMapped={false} />
      </mesh>

      {/* Icon text in the middle */}
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {project.icon}
      </Text>

      {/* Glow light */}
      <pointLight color={project.color} intensity={hovered ? 3 : 1.2} distance={6} />

      {/* Expanded info panel */}
      {(hovered || open) && (
        <Html position={[0, 1.8, 0]} center distanceFactor={6}>
          <div style={{
            background: 'rgba(5, 5, 18, 0.92)',
            border: `1px solid ${project.color}`,
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            maxWidth: '200px',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 0 20px ${project.color}55`,
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{project.icon}</div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: project.color, marginBottom: '6px' }}>
              {project.title}
            </div>
            <div style={{ opacity: 0.8, lineHeight: '1.5' }}>{project.desc}</div>
            <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.5 }}>click to toggle</div>
          </div>
        </Html>
      )}
    </group>
  )
}

/** A floating open book */
function BookOfKhushi({ position }) {
  const bookRef = useRef()

  useFrame(({ clock }) => {
    if (!bookRef.current) return
    const t = clock.elapsedTime
    bookRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.2
    bookRef.current.rotation.y = Math.sin(t * 0.3) * 0.25
    bookRef.current.rotation.z = Math.cos(t * 0.4) * 0.08
  })

  return (
    <group ref={bookRef} position={position}>
      {/* Left page */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 1.2, 0.04]} />
        <meshStandardMaterial color="#1a0a05" roughness={0.8} />
      </mesh>
      {/* Right page */}
      <mesh position={[0.5, 0, 0]} rotation={[0, -0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 1.2, 0.04]} />
        <meshStandardMaterial color="#f5ead8" roughness={0.7} />
      </mesh>
      {/* Spine */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 1.22, 0.06]} />
        <meshStandardMaterial color="#3d1a00" roughness={0.9} />
      </mesh>
      {/* Title on dark cover */}
      <Text
        position={[-0.5, 0.1, 0.038]}
        fontSize={0.1}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.75}
      >
        {'BOOK\nOF\nKHUSHI'}
        <meshStandardMaterial emissive="#d4af37" emissiveIntensity={1.5} toneMapped={false} />
      </Text>
      {/* Glow */}
      <pointLight position={[0, 0, 0.5]} intensity={1.2} color="#d4af37" distance={5} />
    </group>
  )
}

/** Floating café furniture (table, chair, cup) group */
function FloatingFurniture({ position, delay = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + delay
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.35
    groupRef.current.rotation.y += 0.003
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.06
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Table top */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.07, 12]} />
        <meshStandardMaterial color="#3a2010" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Table leg */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#2a1508" roughness={0.7} />
      </mesh>
      {/* Coffee cup */}
      <mesh position={[0.2, 0.55, 0.1]}>
        <cylinderGeometry args={[0.1, 0.08, 0.2, 10]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      {/* Coffee (dark circle on top) */}
      <mesh position={[0.2, 0.66, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.09, 10]} />
        <meshStandardMaterial color="#2a1205" roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Hanging Edison bulb light */
function HangingBulb({ position }) {
  const matRef = useRef()
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.emissiveIntensity = 2.2 + Math.sin(clock.elapsedTime * 3.5 + position[0]) * 0.3
  })

  return (
    <group position={position}>
      {/* Wire */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 4]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial
          ref={matRef}
          color="#ffffaa"
          emissive="#ffcc44"
          emissiveIntensity={2.2}
          roughness={0.1}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, -0.02, 0]} intensity={2.5} color="#ffcc44" distance={8} decay={2} />
    </group>
  )
}

/** Feedback / Bill Folder floating */
function FeedbackFolder({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 0.55 + 1) * 0.22
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.1
    ref.current.rotation.y = Math.sin(t * 0.2) * 0.15
  })

  return (
    <group ref={ref} position={position}>
      {/* Folder body */}
      <mesh castShadow>
        <boxGeometry args={[0.65, 0.82, 0.06]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      {/* Tab */}
      <mesh position={[-0.2, 0.45, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.07]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
      <Text
        position={[0, 0.1, 0.05]}
        fontSize={0.08}
        color="#f5deb3"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.55}
      >
        {'Feedback\n& Reviews'}
      </Text>
    </group>
  )
}

/** Full Phase 4 — The Zero-G Café */
export default function ZeroGCafe({ baseZ = -148 }) {
  return (
    <group>
      {/* ── Café Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, baseZ + 5]} receiveShadow>
        <planeGeometry args={[30, 22]} />
        <meshStandardMaterial color="#1a1008" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* ── Glass side walls */}
      {[[-14, 4, 0], [14, 4, 0]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, baseZ + 5]}>
          <boxGeometry args={[0.18, 9, 22]} />
          <meshStandardMaterial color="#88ccff" roughness={0.0} metalness={0.1} transparent opacity={0.18} />
        </mesh>
      ))}
      {/* Back wall */}
      <mesh position={[0, 4, baseZ - 5.5]}>
        <boxGeometry args={[28.4, 9, 0.18]} />
        <meshStandardMaterial color="#88ccff" roughness={0.0} metalness={0.1} transparent opacity={0.14} />
      </mesh>
      {/* Roof beams */}
      {[-10, -3, 3, 10].map((x, i) => (
        <mesh key={i} position={[x, 8.6, baseZ + 5]}>
          <boxGeometry args={[0.25, 0.22, 22]} />
          <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
        </mesh>
      ))}

      {/* ── Hanging Edison Bulbs */}
      {[[-8, 8, baseZ], [0, 8, baseZ - 2], [8, 8, baseZ], [-4, 8, baseZ + 6], [4, 8, baseZ + 4]].map((pos, i) => (
        <HangingBulb key={i} position={pos} />
      ))}

      {/* ── Floating Furniture */}
      <FloatingFurniture position={[-7, 2.5, baseZ + 2]} delay={0} />
      <FloatingFurniture position={[7, 3.2, baseZ - 3]} delay={1.3} />
      <FloatingFurniture position={[-3, 1.8, baseZ + 6]} delay={2.0} />
      <FloatingFurniture position={[5, 4.1, baseZ + 4]} delay={0.7} />

      {/* ── Book of Khushi */}
      <BookOfKhushi position={[-5, 3.5, baseZ + 1]} />

      {/* ── Feedback Folder */}
      <FeedbackFolder position={[6, 3.8, baseZ - 1]} />

      {/* ── 3 Project Holographic Bubbles */}
      {PROJECTS.map((proj, i) => (
        <ProjectBubble
          key={i}
          project={proj}
          position={[(i - 1) * 5.5, 4.5, baseZ + 3]}
          delay={i * 0.8}
        />
      ))}

      {/* ── Section label */}
      <Text
        position={[0, 7.5, baseZ + 8]}
        fontSize={0.75}
        color="#ffaa44"
        anchorX="center"
        anchorY="middle"
        maxWidth={30}
      >
        {'☕  The Zero-G Café  ☕'}
        <meshStandardMaterial emissive="#ffaa44" emissiveIntensity={2} toneMapped={false} />
      </Text>

      {/* ── Warm ambient fill for the café */}
      <pointLight position={[0, 5, baseZ]} intensity={4} color="#ffddaa" distance={40} decay={2} />
      <ambientLight intensity={0.6} color="#ffcc88" />

      {/* Subtle ground fog plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, baseZ + 5]}>
        <planeGeometry args={[28, 20]} />
        <meshBasicMaterial color="#331100" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
