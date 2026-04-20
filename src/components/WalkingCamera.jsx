import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { ROAD_CURVE } from './GhostOrbs'
import useStore from '../store/useStore'

const MAX_LOOK_ANGLE = Math.PI / 30  // ~6°
const BOB_AMPLITUDE  = 0.07
const BOB_FREQUENCY  = 14

const pointer = { x: 0, y: 0 }
function onPointerMove(e) {
  if (e.touches) {
    if (e.touches.length !== 2) return
    const t = e.touches[0]
    pointer.x = (t.clientX / window.innerWidth)  * 2 - 1
    pointer.y = (t.clientY / window.innerHeight) * 2 - 1
  } else {
    pointer.x = (e.clientX / window.innerWidth)  * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
}

// Phase boundaries by scroll 0→1
const PHASE_THRESHOLDS = [0, 0.25, 0.55, 0.80]

export default function WalkingCamera() {
  const { camera, size } = useThree()
  const scroll   = useScroll()
  const lookX    = useRef(0)
  const lookY    = useRef(0)
  const setScrollPhase = useStore(s => s.setScrollPhase)
  const lastPhase = useRef(-1)

  useEffect(() => {
    camera.fov = size.width < 600 ? 90 : 72
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
    }
  }, [])

  useFrame(() => {
    const t = Math.min(scroll.offset, 0.9999)

    // ── Broadcast current phase to UI ────────────────────────
    let phase = 0
    for (let i = PHASE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (t >= PHASE_THRESHOLDS[i]) { phase = i; break }
    }
    if (phase !== lastPhase.current) {
      lastPhase.current = phase
      setScrollPhase(phase)
    }

    // ── Camera position along curve ──────────────────────────
    const curvePos = ROAD_CURVE.getPoint(t)
    const bob = Math.sin(t * BOB_FREQUENCY * Math.PI) * BOB_AMPLITUDE
    camera.position.set(curvePos.x, curvePos.y + 1.6 + bob, curvePos.z)

    // ── Look-ahead direction ─────────────────────────────────
    const aheadT = Math.min(t + 0.004, 0.9999)
    const ahead  = ROAD_CURVE.getPoint(aheadT)
    ahead.y += 1.6

    // ── Free-look (mouse / touch) ────────────────────────────
    const targetLookX =  pointer.y * MAX_LOOK_ANGLE
    const targetLookY = -pointer.x * MAX_LOOK_ANGLE
    lookX.current += (targetLookX - lookX.current) * 0.1
    lookY.current += (targetLookY - lookY.current) * 0.1

    camera.lookAt(ahead)
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    euler.y += lookY.current
    euler.x += lookX.current
    camera.quaternion.setFromEuler(euler)
  })

  return null
}
