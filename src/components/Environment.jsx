import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../store/useStore'
import * as THREE from 'three'

/**
 * Dynamically syncs scene fog + ambient/directional lighting
 * based on khushiStatus from the Bio-Sync store.
 */

const STATUS_CONFIG = {
  coding: {
    bgColor:          '#001133',
    ambientColor:     '#ffffff',
    ambientIntensity:  1.5,
    dirColor:         '#00aaff',
    dirIntensity:      2.0,
    fogColor:         '#001133',
    fogNear:           8,
    fogFar:            40,
  },
  sleeping: {
    bgColor:          '#110022',
    ambientColor:     '#ffffff',
    ambientIntensity:  1.0,
    dirColor:         '#7700aa',
    dirIntensity:      0.8,
    fogColor:         '#110022',
    fogNear:           5,
    fogFar:            30,
  },
  chilling: {
    bgColor:          '#3B3845',
    ambientColor:     '#ffffff',
    ambientIntensity:  1.5,
    dirColor:         '#ffaa44',
    dirIntensity:      1.6,
    fogColor:         '#3B3845',
    fogNear:           10,
    fogFar:            80,
  },
}

export default function Environment() {
  const { khushiStatus } = useStore()
  const cfg = STATUS_CONFIG[khushiStatus] ?? STATUS_CONFIG.chilling

  const ambRef = useRef()
  const dirRef = useRef()

  // Smooth lerp between states each frame
  useFrame(({ scene }) => {
    if (!ambRef.current || !dirRef.current) return
    const target = new THREE.Color(cfg.ambientColor)
    ambRef.current.color.lerp(target, 0.03)
    ambRef.current.intensity += (cfg.ambientIntensity - ambRef.current.intensity) * 0.03

    const dirTarget = new THREE.Color(cfg.dirColor)
    dirRef.current.color.lerp(dirTarget, 0.03)
    dirRef.current.intensity += (cfg.dirIntensity - dirRef.current.intensity) * 0.03

    // Update scene background and fog color
    scene.background = scene.background || new THREE.Color()
    scene.background.lerp(new THREE.Color(cfg.bgColor), 0.03)
    
    if (scene.fog) {
      scene.fog.color.lerp(new THREE.Color(cfg.fogColor), 0.03)
      scene.fog.near += (cfg.fogNear - scene.fog.near) * 0.03
      scene.fog.far += (cfg.fogFar - scene.fog.far) * 0.03
    }
  })

  return (
    <>
      {/* We no longer attach static fog in Scene.jsx - the Environment manages the dynamic fog and background */}
      <ambientLight ref={ambRef} color={cfg.ambientColor} intensity={cfg.ambientIntensity} />
      <directionalLight
        ref={dirRef}
        color={cfg.dirColor}
        intensity={cfg.dirIntensity}
        position={[10, 20, 10]}
        castShadow={false}
      />
      {/* Point light at arch start for dramatic entrance */}
      <pointLight position={[0, 5, 2]} intensity={1.5} color="#4488ff" distance={30} />
    </>
  )
}
