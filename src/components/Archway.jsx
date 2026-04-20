import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Solid Monolithic Stone Archway — matches the reference image.
 * A single continuous stone slab with an arch cutout.
 * "KHUSHI'S WORLD" is written on the solid stone above the hole.
 */
export default function Archway() {
  const textMatRef = useRef()

  // Animate neon text pulse slightly for a nice subtle effect
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (textMatRef.current) {
      textMatRef.current.emissiveIntensity = 2.5 + Math.sin(t * 2.0) * 0.5
    }
  })

  // Simple minimal stone material for the low-poly / smooth look, like the reference
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#656570',
    roughness: 0.85,
    metalness: 0.1,
  }), [])

  // Create the monolithic shape
  const archShape = useMemo(() => {
    const shape = new THREE.Shape()

    // Outer boundary (Width 18, Height 12) - Drawn Counter-Clockwise
    shape.moveTo(-9, 0)
    shape.lineTo(9, 0)
    shape.lineTo(9, 11.5)
    shape.lineTo(8.5, 12)
    shape.lineTo(-8.5, 12)
    shape.lineTo(-9, 11.5)
    shape.lineTo(-9, 0)

    // Inner arch cutout (Width 8, Height up to 8) - Drawn Clockwise for the hole
    const hole = new THREE.Path()
    hole.moveTo(-4.5, 0)
    hole.lineTo(-4.5, 4)
    // arc center(0,4), radius 4.5, from PI to 0, clockwise=true
    hole.absarc(0, 4, 4.5, Math.PI, 0, true)
    hole.lineTo(4.5, 0)
    hole.lineTo(-4.5, 0)
    
    shape.holes.push(hole)
    return shape
  }, [])

  const extrudeDepth = 2.5

  return (
    <group position={[0, 0, -16]}>
      
      {/* ── MAIN MONOLITHIC ARCH ────────────────────────────── */}
      <mesh position={[0, 0, -extrudeDepth / 2]} castShadow receiveShadow>
        <extrudeGeometry args={[archShape, {
          depth: extrudeDepth,
          bevelEnabled: true,
          bevelSegments: 4,
          bevelSize: 0.4,
          bevelThickness: 0.4,
        }]} />
        <primitive object={stoneMat} attach="material" />
      </mesh>

      {/* ── "KHUSHI'S WORLD" NEON TEXT ───────────────────────── */}
      <Text
        position={[0, 10.2, extrudeDepth / 2 + 0.45]}
        fontSize={1.4}
        letterSpacing={0.06}
        anchorX="center"
        anchorY="middle"
        maxWidth={20}
      >
        {"KHUSHI'S WORLD"}
        <meshStandardMaterial
          ref={textMatRef}
          color="#ffffff"
          emissive="#00e5ff"
          emissiveIntensity={2.8}
          toneMapped={false}
        />
      </Text>

      {/* Cyan point light to cast neon glow onto the stone face */}
      <pointLight position={[0, 10.2, extrudeDepth / 2 + 1.5]} intensity={6} color="#00e5ff" distance={15} decay={2} />
    </group>
  )
}
