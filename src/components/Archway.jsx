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

  // Monolithic arch shape
  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Outer boundary (Start bottom left, go up, curve right, go down)
    shape.moveTo(-6, -0.5)
    shape.lineTo(-6, 7)
    shape.quadraticCurveTo(-5, 12, 0, 12)
    shape.quadraticCurveTo(5, 12, 6, 7)
    shape.lineTo(6, -0.5)
    
    // Inner boundary (Start bottom right, go up, curve left, go down)
    shape.lineTo(3.5, -0.5)
    shape.lineTo(3.5, 6)
    shape.quadraticCurveTo(3, 9, 0, 9)
    shape.quadraticCurveTo(-3, 9, -3.5, 6)
    shape.lineTo(-3.5, -0.5)
    
    // Close shape
    shape.lineTo(-6, -0.5)
    
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
      {/* Front face is exactly at Z=1.0 (since depth is 2 and we offset by -1.0) */}
      <Text
        position={[0, 10.2, 1.01]} // 1.01 sits perfectly flush on the surface
        fontSize={1.1}             // Larger text matching the concept art
        letterSpacing={0.06}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={9}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={matRef}
          color="white"
          emissive="#00ffff"
          emissiveIntensity={3.5}
          toneMapped={false}
        />
      </Text>

      {/* Ambient glow point light to illuminate the dark stone under the text */}
      <pointLight position={[0, 10.2, 2.5]} intensity={3} color="#00ffff" distance={12} />
    </group>
  )
}
