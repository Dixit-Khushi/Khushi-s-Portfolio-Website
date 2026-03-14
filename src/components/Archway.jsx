import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Grand Entrance Archway at [0, 0, -15]
 * Built as a single monolithic stone piece using Shape & ExtrudeGeometry
 * matching "The Threshold" concept art perfectly.
 */
export default function Archway() {
  const matRef = useRef()

  // Animate glow intensity via material ref
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 2.5 + Math.sin(clock.elapsedTime * 2.0) * 1.0
    }
  })

  // Monolithic arch shape matches "The Threshold" exactly (Flat top, arched hole)
  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Outer boundary (Flat giant rectangle)
    shape.moveTo(-7, -0.5)
    shape.lineTo(-7, 12)
    shape.lineTo(7, 12)
    shape.lineTo(7, -0.5)
    
    // Inner boundary (Arched tunnel)
    shape.lineTo(4, -0.5)
    shape.lineTo(4, 5)
    // Curve top of the tunnel
    shape.quadraticCurveTo(4, 8.5, 0, 8.5)
    shape.quadraticCurveTo(-4, 8.5, -4, 5)
    shape.lineTo(-4, -0.5)
    
    // Close shape
    shape.lineTo(-7, -0.5)
    
    return shape
  }, [])

  const extrudeSettings = useMemo(() => ({
    depth: 2.0,            // How thick the archway is (Z axis)
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 2,
    bevelSize: 0.15,
    bevelThickness: 0.15,
  }), [])

  // Stone-like material matching the dusk aesthetic
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6a6a74',   // Darker stone so the glow pops
    roughness: 0.95,
    metalness: 0.1,
  }), [])

  return (
    <group position={[0, 0, -15]}>
      
      {/* Monolithic Extruded Arch */}
      {/* ExtrudeGeometry builds from Z=0 back to Z=depth. We want center at Z=0, so push back by -depth/2 */}
      <mesh position={[0, 0, -1.0]} castShadow receiveShadow material={stoneMat}>
        <extrudeGeometry args={[archShape, extrudeSettings]} />
      </mesh>

      {/* Glowing "KHUSHI'S WORLD" text - engraved flush into the front face */}
      {/* Extrude depth is 2 centered at Z=0 -> face is Z=1.0. Bevel adds 0.15 -> face is Z=1.15. Text must be at 1.16 to be visible! */}
      <Text
        position={[0, 10.2, 1.16]} 
        fontSize={1.2}             // Larger text matching the concept art
        letterSpacing={0.06}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={matRef}
          color="white"
          emissive="#00ffff"
          emissiveIntensity={4.5}
          toneMapped={false}
        />
      </Text>

      {/* Ambient glow point light to illuminate the dark stone under the text */}
      <pointLight position={[0, 10.2, 2.5]} intensity={4} color="#00ffff" distance={12} />
    </group>
  )
}
