import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene'
import BioSyncUI from './components/BioSyncUI'

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-cyan-300 text-sm tracking-widest uppercase font-semibold neon-text">
        Entering the Echo-System...
      </p>
    </div>
  )
}

export default function App() {
  return (
    <div className="w-full h-full relative bg-black">
      {/* 3D Stage */}
      <Canvas
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 75, near: 0.1, far: 300, position: [0, 1.6, 0] }}
        shadows={false}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* 2D Overlay */}
      <Suspense fallback={<LoadingScreen />}>
        <BioSyncUI />
      </Suspense>

      {/* Title watermark bottom-right */}
      <div className="absolute bottom-5 right-5 text-white/20 text-xs tracking-widest uppercase pointer-events-none select-none">
        The Living Echo-System • Phase 1
      </div>
    </div>
  )
}
