import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Grand Entrance Archway at [0, 0, 0]
 * Built from BoxGeometry pillars + TorusGeometry arc + Text label.
 */
export default function Archway() {
  const glowRef = useRef()

  // Animate glow intensity
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 1.2 + Math.sin(clock.elapsedTime * 1.6) * 0.4
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
      <mesh position={[0, 6.5, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[3.2, 0.55, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#3e3e46" roughness={0.95} />
      </mesh>

      {/* Decorative side stones - left */}
      <mesh position={[-3.5, 8.4, 0]} material={stoneMat}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
      </mesh>
      {/* Decorative side stones - right */}
      <mesh position={[3.5, 8.4, 0]} material={stoneMat}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
      </mesh>

      {/* Glowing "KHUSHI'S WORLD" text */}
      <Text
        ref={glowRef}
        position={[0, 9.8, 0]}
        fontSize={0.9}
        letterSpacing={0.08}
        color="#00eeff"
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
        font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4G-EiAou6Y.woff2"
      >
        KHUSHI'S WORLD
        <meshStandardMaterial
          color="#00eeff"
          emissive="#00eeff"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </Text>

      {/* Invisible ground plane under arch for shadow receipt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#111118" transparent opacity={0} />
      </mesh>
    </group>
  )
}
