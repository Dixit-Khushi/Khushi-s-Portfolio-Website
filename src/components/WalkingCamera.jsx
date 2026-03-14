import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { ROAD_CURVE } from './GhostOrbs'

/**
 * WalkingCamera
 * ─────────────
 * • Moves camera along ROAD_CURVE based on scroll offset
 * • Applies sine-wave head-bob on Y axis
 * • Free-look via pointer (mouse/touch) clamped to ±45°
 */

const MAX_LOOK_ANGLE = Math.PI / 4  // 45 degrees
const BOB_AMPLITUDE  = 0.08
const BOB_FREQUENCY  = 12

// Pointer state shared via module-level ref (avoids React overhead)
const pointer = { x: 0, y: 0 }

function onPointerMove(e) {
  // Normalise to -1..1
  const touch = e.touches ? e.touches[0] : e
  pointer.x = (touch.clientX / window.innerWidth)  * 2 - 1
  pointer.y = (touch.clientY / window.innerHeight) * 2 - 1
}

export default function WalkingCamera() {
  const { camera, size } = useThree()
  const scroll = useScroll()
  const lookX  = useRef(0) // current look yaw   (around Y)
  const lookY  = useRef(0) // current look pitch  (around X)

  // Responsive FOV: wider on portrait mobile
  useEffect(() => {
    camera.fov = size.width < 600 ? 90 : 75
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  // Register pointer listeners
  useEffect(() => {
    window.addEventListener('mousemove',  onPointerMove)
    window.addEventListener('touchmove',  onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove',  onPointerMove)
      window.removeEventListener('touchmove',  onPointerMove)
    }
  }, [])

  useFrame(() => {
    // ── 1. Scroll → position along curve ──────────────────────
    const t = Math.min(scroll.offset, 0.9999)
    const curvePos = ROAD_CURVE.getPoint(t)

    // Head-bob
    const bob = Math.sin(t * BOB_FREQUENCY * Math.PI) * BOB_AMPLITUDE

    camera.position.set(
      curvePos.x,
      curvePos.y + 1.6 + bob,   // 1.6 = eye height
      curvePos.z,
    )

    // ── 2. Look-ahead direction ────────────────────────────────
    const ahead = ROAD_CURVE.getPoint(Math.min(t + 0.005, 1))
    ahead.y += 1.6 // Look at eye level, not at the floor!
    const baseQ = new THREE.Quaternion()
    const lookAtM = new THREE.Matrix4().lookAt(
      camera.position,
      ahead,
      new THREE.Vector3(0, 1, 0),
    )
    baseQ.setFromRotationMatrix(lookAtM)

    // ── 3. Free-look offset (clamped ±45°) ────────────────────
    // pointer.y is -1 (top) to 1 (bottom).
    // We want y=0 to be looking straight. So target pitch is simply pointer.y * MAX_LOOK_ANGLE.
    const targetLookX = pointer.y * MAX_LOOK_ANGLE  // pitch
    const targetLookY = -pointer.x * MAX_LOOK_ANGLE  // yaw

    // Smooth lerp
    lookX.current += (targetLookX - lookX.current) * 0.06
    lookY.current += (targetLookY - lookY.current) * 0.06

    // Apply look offsets naturally (like a human head) using YXZ order to completely prevent roll.
    camera.lookAt(ahead)
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    euler.y += lookY.current
    euler.x += lookX.current
    camera.quaternion.setFromEuler(euler)
  })

  return null
}
