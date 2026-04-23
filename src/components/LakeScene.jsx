import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/** Static lake — no per-frame vertex animation, uses envMapIntensity for shimmer */
function Lake() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
      <planeGeometry args={[80, 60, 1, 1]} />
      <meshStandardMaterial
        color="#0a2a4a"
        roughness={0.05}
        metalness={0.7}
        transparent
        opacity={0.88}
      />
    </mesh>
  )
}

/** Floating glowing bottle — no pointLight, just emissive */
function MessageBottle({ position, message, delay = 0 }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + delay
    groupRef.current.position.y = position[1] + Math.sin(t * 0.7) * 0.18
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.55, 7]} />
        <meshStandardMaterial color="#22aa66" roughness={0.1} metalness={0.3} transparent opacity={0.72} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.055, 0.12, 0.22, 6]} />
        <meshStandardMaterial color="#22aa66" roughness={0.1} transparent opacity={0.72} />
      </mesh>
      {/* Cork */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.058, 0.058, 0.1, 6]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>
      {/* Inner glow — no pointLight, just emissive sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshBasicMaterial color="#aaff88" transparent opacity={0.7} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Simple pendulum swing tree */
function TreeWithSwing({ position }) {
  const swingRef = useRef()
  const swingAngle = useRef(0.45)
  const swingVel = useRef(0)

  useFrame((_, delta) => {
    if (!swingRef.current) return
    const gravity = -4.2, ropeLen = 2.2, damping = 0.994
    const acc = (gravity / ropeLen) * Math.sin(swingAngle.current)
    swingVel.current = (swingVel.current + acc * delta) * damping
    swingAngle.current += swingVel.current * delta
    swingRef.current.rotation.z = swingAngle.current
  })

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.42, 7, 6]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
      </mesh>
      {/* Simple canopy */}
      <mesh position={[0, 8.5, 0]} castShadow>
        <sphereGeometry args={[3.0, 7, 6]} />
        <meshStandardMaterial color="#1a3d1a" roughness={0.9} />
      </mesh>
      {/* Swing */}
      <group position={[-1.4, 7.5, 0]} ref={swingRef}>
        <mesh position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 2.2, 3]} />
          <meshStandardMaterial color="#8B7355" roughness={0.85} />
        </mesh>
        <mesh position={[0, -2.2, 0]} castShadow>
          <boxGeometry args={[0.75, 0.08, 0.32]} />
          <meshStandardMaterial color="#6B4E2A" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

/** Stars — single draw call with Points */
function Stars() {
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < 400; i++) {
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

export default function LakeScene({ baseZ = -105 }) {
  const bottles = [
    { pos: [-6, 0.2, baseZ - 5],  msg: '"She debugs faster than most people read code." — Mentor', delay: 0 },
    { pos: [ 5, 0.2, baseZ - 12], msg: '"Khushi turns ideas into working prototypes overnight." — Teammate', delay: 1.2 },
    { pos: [-3, 0.2, baseZ - 20], msg: '"Her AI project won the college hackathon." — Jury', delay: 0.7 },
  ]

  return (
    <group>
      <Stars />
      <group position={[0, 0, baseZ - 10]}>
        <Lake />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, baseZ - 10]} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#0d1a12" roughness={0.95} />
      </mesh>
      <TreeWithSwing position={[-9, -0.35, baseZ - 8]} />
      {bottles.map((b, i) => (
        <MessageBottle key={i} position={b.pos} message={b.msg} delay={b.delay} />
      ))}
      <directionalLight position={[-10, 25, baseZ]} intensity={0.6} color="#5577cc" />
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
