import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Edges, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function InnerLogo({ url, color }) {
  const texture = useTexture(url)
  return (
    <mesh>
      <planeGeometry args={[0.7, 0.7]} />
      {/* Add additive blending so the icon glows like a hologram */}
      <meshBasicMaterial 
        map={texture} 
        transparent={true} 
        side={THREE.DoubleSide} 
        depthWrite={false}
        color={color}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default function SkillCrystal({ position, color, iconUrl, tooltipText = "Click to see\nmy projects", delay = 0 }) {
  const groupRef = useRef()
  const matRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Initial base y from props
  const baseY = position[1]

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime + delay
    
    // Y-axis bobbing
    groupRef.current.position.y = baseY + Math.sin(time * 2) * 0.2
    
    // Rotation
    const rotSpeed = hovered ? 2 : 0.5
    groupRef.current.rotation.y += 0.01 * rotSpeed
  })

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

  // The elongated octahedron geometry
  const geom = useMemo(() => new THREE.OctahedronGeometry(0.6, 0), [])

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={groupRef} position={[0, baseY, 0]}>
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          scale={[1, 2, 1]} // Elongate vertically to match reference
          geometry={geom}
        >
          {/* Glassy transparent crystal body */}
          <meshPhysicalMaterial 
            ref={matRef}
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.2}
            transparent
            opacity={0.15}
            roughness={0.1}
            metalness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
          {/* Glowing wireframe edges matching the reference */}
          <Edges 
            linewidth={hovered ? 4 : 2} 
            threshold={15} 
            color={color} 
          />
        </mesh>

        {/* The inner tech logo */}
        {iconUrl && (
          <InnerLogo url={iconUrl} color={color} />
        )}

        {/* The "Click to see my projects" tooltip */}
        <Html position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(25, 25, 25, 0.9)', 
            color: '#eee', 
            padding: '6px 10px', 
            borderRadius: '6px',
            fontSize: '11px', 
            fontWeight: 'bold',
            whiteSpace: 'pre-line', // Allows \n to wrap
            textAlign: 'center',
            border: '1px solid #444',
            pointerEvents: 'none',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {tooltipText}
            {/* The little downward arrow */}
            <div style={{
              position: 'absolute', 
              bottom: '-5px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              borderWidth: '5px 5px 0', 
              borderStyle: 'solid', 
              borderColor: 'rgba(25, 25, 25, 0.9) transparent transparent transparent'
            }} />
          </div>
        </Html>
      </group>
    </group>
  )
}
