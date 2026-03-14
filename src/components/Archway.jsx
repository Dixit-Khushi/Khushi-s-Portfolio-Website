import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Grand Entrance Archway at [0, 0, 0]
 * Built from BoxGeometry pillars + TorusGeometry arc + Text label.
 */
export default function Archway() {
  const matRef = useRef()

  // Animate glow intensity via material ref
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 1.6) * 0.5
    }
  })

  // Stone-like material
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a4a52',
    roughness: 0.9,
    metalness: 0.05,
  }), [])

  return (
    <group position={[0, 0, -2]}>
      {/* Left pillar */}
      <mesh position={[-3.5, 4, 0]} castShadow material={stoneMat}>
        <boxGeometry args={[1.2, 8, 1.2]} />
      </mesh>

      {/* Right pillar */}
      <mesh position={[3.5, 4, 0]} castShadow material={stoneMat}>
        <boxGeometry args={[1.2, 8, 1.2]} />
      </mesh>

      {/* Lintel / top crossbar */}
      <mesh position={[0, 8.4, 0]} castShadow material={stoneMat}>
        <boxGeometry args={[8.2, 1.0, 1.2]} />
      </mesh>

      {/* Arch crown (Torus, half visible) */}
      <mesh position={[0, 6.5, 0]}>
        <torusGeometry args={[3.2, 0.55, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#3e3e46" roughness={0.95} />
      </mesh>

      {/* Decorative corner stones */}
      <mesh position={[-3.5, 8.4, 0]} material={stoneMat}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
      </mesh>
      <mesh position={[3.5, 8.4, 0]} material={stoneMat}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
      </mesh>

      {/* Glowing "KHUSHI'S WORLD" text */}
      <Text
        position={[0, 9.8, 0.62]}
        fontSize={0.85}
        letterSpacing={0.08}
        color="#00eeff"
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={matRef}
          color="#00eeff"
          emissive="#00eeff"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </Text>

      {/* Ambient glow point light under arch text */}
      <pointLight position={[0, 9.5, 1]} intensity={2} color="#00eeff" distance={8} />
    </group>
  )
}
