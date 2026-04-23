import { useState, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CanvasTexture sign label — drawn onto an HTML canvas so it's
 * pure WebGL geometry (no Html/DOM overlay = no ScrollControls issues).
 */
function makeLabel(text, hovered = false) {
  const W = 512, H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)
  ctx.font = 'bold 68px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 10
  ctx.fillStyle = hovered ? '#ffffff' : '#f5dcc8'
  ctx.fillText(text, W / 2, H / 2)
  return new THREE.CanvasTexture(canvas)
}

function SignBoard({ boardWidth = 2.6, boardHeight = 0.7, label, url, tilt, boardPosition }) {
  const [hovered, setHovered] = useState(false)
  const texture = useMemo(() => makeLabel(label, hovered), [label, hovered])

  const onOver  = (e) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer' }
  const onOut   = (e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'    }
  const onPress = (e) => { e.stopPropagation(); window.open(url, '_blank', 'noopener,noreferrer') }

  return (
    <group position={boardPosition} rotation={[0, 0, tilt]}>
      {/* Wooden board */}
      <mesh castShadow receiveShadow onPointerOver={onOver} onPointerOut={onOut} onPointerUp={onPress}>
        <boxGeometry args={[boardWidth, boardHeight, 0.14]} />
        <meshStandardMaterial color={hovered ? '#7D5C51' : '#5D3A2A'} roughness={0.85} />
      </mesh>
      {/* Text texture — renderOrder=999, depthTest=false → always on top */}
      <mesh position={[0, 0, 0.08]} renderOrder={999} onPointerOver={onOver} onPointerOut={onOut} onPointerUp={onPress}>
        <planeGeometry args={[boardWidth - 0.15, boardHeight - 0.15]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  )
}

export default function SocialSignpost({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <pointLight position={[0, 2, 1.5]} intensity={5} distance={10} color="#ffd090" />

      {/* Pole */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 3.4, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>

      {/* GitHub — top board */}
      <SignBoard
        label="GitHub"
        url="https://github.com/Dixit-Khushi"
        tilt={0.08}
        boardPosition={[0.15, 2.65, 0]}
      />

      {/* LinkedIn — bottom board */}
      <SignBoard
        label="LinkedIn"
        url="https://www.linkedin.com/in/dixit-khushi"
        tilt={-0.08}
        boardPosition={[-0.15, 1.88, 0]}
      />
    </group>
  )
}
