import { useState } from 'react'
import { Text } from '@react-three/drei'

export default function SocialSignpost({ position, rotation }) {
  const [hoveredGithub, setHoverGithub] = useState(false)
  const [hoveredLinkedin, setHoverLinkedin] = useState(false)

  const handlePointerOver = (e, setter) => {
    e.stopPropagation()
    setter(true)
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = (e, setter) => {
    e.stopPropagation()
    setter(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Pole */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>

      {/* GitHub Sign */}
      <mesh 
        position={[0.2, 2.5, 0]} 
        rotation={[0, 0, 0.1]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          window.open('https://github.com', '_blank')
        }}
        onPointerOver={(e) => handlePointerOver(e, setHoverGithub)}
        onPointerOut={(e) => handlePointerOut(e, setHoverGithub)}
      >
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color={hoveredGithub ? '#5D4037' : '#4E342E'} roughness={0.8} />
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          GitHub
        </Text>
      </mesh>

      {/* LinkedIn Sign */}
      <mesh 
        position={[-0.3, 1.8, 0]} 
        rotation={[0, 0, -0.15]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          window.open('https://linkedin.com', '_blank')
        }}
        onPointerOver={(e) => handlePointerOver(e, setHoverLinkedin)}
        onPointerOut={(e) => handlePointerOut(e, setHoverLinkedin)}
      >
        <boxGeometry args={[1.6, 0.5, 0.1]} />
        <meshStandardMaterial color={hoveredLinkedin ? '#5D4037' : '#4E342E'} roughness={0.8} />
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          LinkedIn
        </Text>
      </mesh>
    </group>
  )
}
