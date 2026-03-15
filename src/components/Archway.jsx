import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Grand Entrance Archway — 100% accurate monolithic stone block.
 * Features organic, hand-chipped stone edges and a curved arched tunnel.
 */
export default function Archway() {
  const matRef = useRef()

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 2 + Math.sin(clock.elapsedTime * 2.5) * 0.5
    }
  })

  // Create a monolithic shape with organic, slightly irregular edges
  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Outer boundary: Slightly irregular wide rectangle for "chipped stone" look
    shape.moveTo(-11.2, -0.5)
    shape.lineTo(-10.8, 3.5)
    shape.lineTo(-11.4, 7.8)
    shape.lineTo(-11.0, 12.2) // Top left
    shape.lineTo(11.0,  12.3) // Top right
    shape.lineTo(11.4,  8.2)
    shape.lineTo(10.8,  2.5)
    shape.lineTo(11.2,  -0.5)
    
    // Inner boundary: Arched tunnel hole
    const hole = new THREE.Path()
    hole.moveTo(6.5, -0.5)
    hole.lineTo(6.5, 6.0)
    // Quadratic curve for the arch top
    hole.quadraticCurveTo(6.5, 9.5, 0, 9.5)
    hole.quadraticCurveTo(-6.5, 9.5, -6.5, 6.0)
    hole.lineTo(-6.5, -0.5)
    hole.lineTo(6.5, -0.5)
    
    shape.holes.push(hole)
    return shape
  }, [])

  const extrudeSettings = useMemo(() => ({
    depth: 4.5, // Thick monolithic block
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.6,
    bevelThickness: 0.6,
  }), [])

  return (
    <group position={[0, -0.1, -15]}>
      {/* Monolithic Arch Mesh */}
      <mesh position={[0, 0, -2.25]} castShadow receiveShadow>
        <extrudeGeometry args={[archShape, extrudeSettings]} />
        <meshStandardMaterial color="#6a6e78" roughness={0.85} />
      </mesh>

      {/* Glowing "KHUSHI'S WORLD" neon text */}
      {/* Positioned flush on the beveled face (depth/2 + bevel = 2.25 + 0.6 = 2.85) */}
      <Suspense fallback={null}>
        <Text
          position={[0, 11.0, 3.2]} // Pushed forward to avoid any depth-fighting with the beveled face
          fontSize={1.6}
          letterSpacing={0.06}
          color="#00e5ff"
          anchorX="center"
          anchorY="middle"
          maxWidth={20}
        >
          {"KHUSHI'S WORLD"}
          <meshStandardMaterial
            ref={matRef}
            color="white"
            emissive="#00e5ff"
            emissiveIntensity={10} // Super high for bloom
            toneMapped={false}
          />
        </Text>
      </Suspense>

      <pointLight position={[0, 11, 2]} intensity={4} color="#00e5ff" distance={15} />
    </group>
  )
}

