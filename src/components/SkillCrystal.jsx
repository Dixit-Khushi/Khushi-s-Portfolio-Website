import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function SkillCrystal({ position, color, tooltipText, delay = 0 }) {
  const meshRef = useRef()
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Initial base y from props
  const baseY = position[1]

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime + delay
    
    // Y-axis bobbing
    meshRef.current.position.y = baseY + Math.sin(time * 2) * 0.4
    
    // Rotation
    const rotSpeed = hovered ? 3 : 1
    meshRef.current.rotation.y += 0.01 * rotSpeed
    meshRef.current.rotation.x += 0.005 * rotSpeed

    // Emissive intensity
    if (matRef.current) {
      // Lerp for smooth transition
      const targetIntensity = hovered ? 4 : 1
      matRef.current.emissiveIntensity += (targetIntensity - matRef.current.emissiveIntensity) * 0.1
    }
  })

  // Add pointer cursor on hover
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh
        ref={meshRef}
        position={[0, baseY, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
      >
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={1}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
        
        {/* Tooltip */}
        <Html
          position={[0, 1.0, 0]}
          center
          style={{
            transition: 'all 0.2s',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.8)',
            pointerEvents: 'none'
          }}
        >
          <div style={{
            background: 'rgba(20, 20, 25, 0.7)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${color}`,
            boxShadow: `0 0 10px ${color}40`,
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {tooltipText}
          </div>
        </Html>
      </mesh>
      
      {/* Light Source */}
      <pointLight color={color} intensity={hovered ? 2 : 0.5} distance={5} position={[0, baseY, 0]} />
    </group>
  )
}
