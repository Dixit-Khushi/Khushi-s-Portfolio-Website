import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -75]} receiveShadow>
      <planeGeometry args={[120, 200]} />
      <meshStandardMaterial color="#3a6b28" roughness={0.95} />
    </mesh>
  )
}

// Floating lanterns — emissive only, no pointLights
function SimpleLanterns() {
  const positions = [
    [-5, 2.4, -6],   [5, 2.4, -12],  [-5, 2.4, -18],
    [5,  2.4, -58],  [-5, 2.4, -70], [5,  2.4, -82],
    [-5, 2.6, -112], [5,  2.6, -127],
  ]
  const colors = ['#ff8844','#cc44ff','#ffcc44','#44ddff','#ff8844','#cc44ff','#4488ff','#aa44ff']

  const groupRef = useRef()
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      child.position.y = positions[i][1] + Math.sin(clock.elapsedTime * 0.8 + i * 1.3) * 0.18
    })
  })

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={[...pos]}>
          <sphereGeometry args={[0.16, 7, 7]} />
          <meshStandardMaterial
            color={colors[i]}
            emissive={colors[i]}
            emissiveIntensity={2.0}
            toneMapped={false}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Surroundings() {
  return (
    <group>
      <Ground />
      <SimpleLanterns />
    </group>
  )
}
