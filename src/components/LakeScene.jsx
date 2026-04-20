import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'

/** Animated lake water with sine-wave vertex displacement */
function Lake() {
  const meshRef = useRef()
  const geomRef = useRef()

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(120, 80, 64, 64)
  }, [])

  useFrame(({ clock }) => {
    if (!geomRef.current) return
    const t = clock.elapsedTime
    const pos = geomRef.current.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = Math.sin(x * 0.15 + t * 0.8) * 0.18
             + Math.cos(y * 0.12 + t * 0.6) * 0.12
             + Math.sin((x + y) * 0.08 + t * 1.1) * 0.08
      pos.setZ(i, z)
    }
    pos.needsUpdate = true
    geomRef.current.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
      <primitive object={geometry} ref={geomRef} attach="geometry" />
      <meshStandardMaterial
        color="#0a2a4a"
        roughness={0.05}
        metalness={0.6}
        transparent
        opacity={0.88}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

/** A floating glowing bottle with a message inside */
function MessageBottle({ position, message, delay = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + delay
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.18
    groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.12
    groupRef.current.rotation.y += 0.004
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Bottle body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.55, 10]} />
        <meshStandardMaterial
          color="#22aa66"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.72}
        />
      </mesh>
      {/* Bottle neck */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.12, 0.22, 8]} />
        <meshStandardMaterial color="#22aa66" roughness={0.1} metalness={0.3} transparent opacity={0.72} />
      </mesh>
      {/* Cork */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.1, 8]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color="#aaff88" transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#88ff66" distance={3} />

      {/* Tooltip on hover */}
      <Html position={[0, 0.9, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(5, 15, 30, 0.82)',
          border: '1px solid #44ffaa',
          borderRadius: '8px',
          padding: '8px 14px',
          color: '#ccffee',
          fontFamily: 'sans-serif',
          fontSize: '11px',
          maxWidth: '160px',
          textAlign: 'center',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 0 12px #44ffaa44',
          pointerEvents: 'none',
          whiteSpace: 'pre-wrap',
        }}>
          📜 {message}
        </div>
      </Html>
    </group>
  )
}

/** A silhouette tree with a physics-simulated swing */
function TreeWithSwing({ position }) {
  const swingRef = useRef()
  const swingAngle = useRef(0.45)
  const swingVel = useRef(0)

  // Simple pendulum physics
  useFrame((_, delta) => {
    if (!swingRef.current) return
    const gravity = -4.2
    const ropeLen = 2.2
    const damping = 0.994
    const acc = (gravity / ropeLen) * Math.sin(swingAngle.current)
    swingVel.current = (swingVel.current + acc * delta) * damping
    swingAngle.current += swingVel.current * delta
    swingRef.current.rotation.z = swingAngle.current
  })

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 7, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      {/* Main branches */}
      <mesh position={[-1.2, 7.2, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.22, 3.5, 6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      <mesh position={[1.0, 7.2, 0.3]} rotation={[0.2, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.18, 3, 6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>

      {/* Leaf Canopy (multiple overlapping spheres) */}
      {[
        [0, 9, 0, 3.2], [-2, 8.5, 0.5, 2.4], [2, 8.2, -0.5, 2.2],
        [-1, 10.5, 0, 2.0], [1.5, 9.8, 0.5, 1.8],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#1a3d1a' : '#0f2d0f'}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Swing rope (pivot at branch) + seat */}
      <group position={[-1.4, 7.5, 0]} ref={swingRef}>
        {/* Left rope */}
        <mesh position={[-0.28, -1.1, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 2.2, 4]} />
          <meshStandardMaterial color="#8B7355" roughness={0.85} />
        </mesh>
        {/* Right rope */}
        <mesh position={[0.28, -1.1, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 2.2, 4]} />
          <meshStandardMaterial color="#8B7355" roughness={0.85} />
        </mesh>
        {/* Seat plank */}
        <mesh position={[0, -2.2, 0]} castShadow>
          <boxGeometry args={[0.75, 0.08, 0.32]} />
          <meshStandardMaterial color="#6B4E2A" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

/** Stars particle field */
function Stars() {
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 600; i++) {
      arr.push(
        (Math.random() - 0.5) * 200,
        15 + Math.random() * 40,
        (Math.random() - 0.5) * 200,
      )
    }
    return new Float32Array(arr)
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#aaccff" size={0.22} sizeAttenuation transparent opacity={0.75} toneMapped={false} />
    </points>
  )
}

/** Full Phase 3 — The Sanctuary */
export default function LakeScene({ baseZ = -105 }) {
  const bottles = [
    { pos: [-8, 0.2, baseZ - 5],  msg: '"She debugs faster than most people read code." — Mentor', delay: 0 },
    { pos: [ 6, 0.2, baseZ - 12], msg: '"Khushi turns ideas into working prototypes overnight." — Teammate', delay: 1.2 },
    { pos: [-4, 0.2, baseZ - 20], msg: '"Her AI project won the college hackathon." — Jury', delay: 0.7 },
    { pos: [ 10, 0.2, baseZ - 8], msg: '"Creative problem-solver with serious potential." — Professor', delay: 2.1 },
    { pos: [-12, 0.2, baseZ - 18],msg: '"Always delivers. Always improves." — Project Lead', delay: 1.5 },
  ]

  return (
    <group position={[0, 0, 0]}>
      <Stars />

      {/* Lake water surface */}
      <group position={[0, 0, baseZ - 10]}>
        <Lake />
      </group>

      {/* Lake shore ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, baseZ - 10]} receiveShadow>
        <planeGeometry args={[130, 90]} />
        <meshStandardMaterial color="#0d1a12" roughness={0.95} />
      </mesh>

      {/* Large silhouette tree with swing */}
      <TreeWithSwing position={[-9, -0.35, baseZ - 8]} />

      {/* Smaller trees */}
      <mesh position={[12, 4, baseZ - 15]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 7]} />
        <meshStandardMaterial color="#1a1008" roughness={0.95} />
      </mesh>
      <mesh position={[12, 8.5, baseZ - 15]} castShadow>
        <sphereGeometry args={[2.5, 7, 7]} />
        <meshStandardMaterial color="#102010" roughness={0.9} />
      </mesh>

      {/* Message bottles floating */}
      {bottles.map((b, i) => (
        <MessageBottle key={i} position={b.pos} message={b.msg} delay={b.delay} />
      ))}

      {/* ── Moonlight / Night lighting */}
      <directionalLight position={[-10, 25, baseZ]} intensity={0.6} color="#5577cc" />
      <pointLight position={[0, 12, baseZ - 10]} intensity={2.0} color="#223355" distance={80} />

      {/* Section label */}
      <Text
        position={[0, 9, baseZ - 2]}
        fontSize={0.85}
        color="#44aaff"
        anchorX="center"
        anchorY="middle"
        maxWidth={30}
      >
        {'✦  The Sanctuary  ✦'}
        <meshStandardMaterial emissive="#44aaff" emissiveIntensity={2} toneMapped={false} />
      </Text>
    </group>
  )
}
