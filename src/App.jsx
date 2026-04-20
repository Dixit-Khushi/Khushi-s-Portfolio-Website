import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import Scene from './components/Scene'
import BioSyncUI from './components/BioSyncUI'

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-cyan-300 text-sm tracking-widest uppercase font-semibold neon-text">
        Entering Khushi's World...
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
        camera={{ fov: 72, near: 0.1, far: 400, position: [0, 1.6, 0] }}
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

      {/* Watermark */}
      <div className="absolute bottom-5 right-5 text-white/20 text-xs tracking-widest uppercase pointer-events-none select-none">
        Khushi's World • 4 Phases
      </div>

      {/* Scroll hint arrow (fades after interaction) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none select-none opacity-60 animate-bounce">
        <span className="text-white/40 text-[11px] tracking-widest uppercase">scroll</span>
        <span className="text-white/40 text-lg">↓</span>
      </div>
    </div>
  )
}
