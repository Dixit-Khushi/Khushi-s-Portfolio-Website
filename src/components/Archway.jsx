import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'

/**
 * Grand Entrance Archway at [0, 0, -15]
 * Built using soft, curved RoundedBox shapes for a high-end cinematic look.
 */
export default function Archway() {
  const matRef = useRef()

  // Animate glow intensity
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 2 + Math.sin(clock.elapsedTime * 2.0) * 0.5
    }
  })

  return (
    <group position={[0, 0, -15]}>
      
      {/* Left Pillar */}
      <RoundedBox args={[4, 12, 4]} position={[-8, 5.5, 0]} radius={0.4} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#6a6e78" roughness={0.8} />
      </RoundedBox>

      {/* Right Pillar */}
      <RoundedBox args={[4, 12, 4]} position={[8, 5.5, 0]} radius={0.4} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#6a6e78" roughness={0.8} />
      </RoundedBox>

      {/* Top Beam */}
      <RoundedBox args={[20, 5, 4]} position={[0, 10, 0]} radius={0.4} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#6a6e78" roughness={0.8} />
      </RoundedBox>

      {/* Glowing "KHUSHI'S WORLD" text */}
      <Text
        position={[0, 10.2, 2.01]} // Flush with the front face of the Z=4 deep beam (origin centered)
        fontSize={1.6}
        letterSpacing={0.06}
        color="#00e5ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={16}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={matRef}
          color="white"
          emissive="#00e5ff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Text>

      {/* Ambient glow point light */}
      <pointLight position={[0, 10.2, 3]} intensity={4} color="#00e5ff" distance={12} />
    </group>
  )
}
