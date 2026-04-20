import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export default function SkillsOverlay() {
  const [visible, setVisible] = useState(false)
  
  useFrame(({ camera }) => {
    // Archway is at z = -15. Once the camera passes z = -18, show the overlay.
    // Also, fade it out if they go past z = -110.
    const isPastPortal = camera.position.z < -18 && camera.position.z > -110;
    if (visible !== isPastPortal) {
      setVisible(isPastPortal);
    }
  })

  // Using portal={document.body} ensures the HTML is unaffected by 3D camera scaling/perspective
  // Unfortunately, passing document.body directly in SSR can crash, but Vite dev server is fine.
  // We'll just style it fixed relative to the viewport.
  return (
    <Html
      style={{
        position: 'fixed',
        top: '20px',
        right: visible ? '20px' : '-400px', // Slide in from right
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 1000,
        // Reset translation so `Html` doesn't track it center of screen
        transform: 'none' 
      }}
      // This setting disconnects it from 3D space tracking, placing it squarely in screen space
      transform={false}
      fullscreen={true}
    >
      {/* We need an inner wrapper since fullscreen covers the whole screen */}
      <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          width: '320px',
          background: 'rgba(15, 20, 30, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 229, 255, 0.15)',
          padding: '24px',
          borderRadius: '16px',
          color: '#fff',
          fontFamily: 'Inter, system-ui, sans-serif',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(50px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: visible ? 'auto' : 'none',
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', color: '#00e5ff', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: '12px' }}>
          Technical Skills
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#00e5ff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Programming Languages</strong>
          <div style={{ fontSize: '15px', marginTop: '6px', color: '#e0e0e0' }}>Python, C++, JavaScript</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#00e5ff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Web Development</strong>
          <div style={{ fontSize: '15px', marginTop: '6px', color: '#e0e0e0' }}>HTML, CSS, Bootstrap, Tailwind</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#00e5ff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Database</strong>
          <div style={{ fontSize: '15px', marginTop: '6px', color: '#e0e0e0' }}>SQL, MongoDB</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong style={{ color: '#00e5ff', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tools & Libraries</strong>
          <div style={{ fontSize: '15px', marginTop: '6px', color: '#e0e0e0' }}>Git, GitHub, VS Code, NumPy, Pandas</div>
        </div>
        
        <button 
            style={{ 
                background: 'rgba(0, 229, 255, 0.1)', 
                border: '1px solid #00e5ff', 
                color: '#fff', 
                padding: '12px 16px', 
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s',
                textShadow: '0 0 10px rgba(0,229,255,0.5)'
            }}
            onMouseOver={(e) => { 
                e.target.style.background = 'rgba(0, 229, 255, 0.25)';
                e.target.style.boxShadow = '0 0 15px rgba(0,229,255,0.4)';
            }}
            onMouseOut={(e) => { 
                e.target.style.background = 'rgba(0, 229, 255, 0.1)';
                e.target.style.boxShadow = 'none';
            }}
            onClick={() => window.open('#', '_blank')}
        >
          View Full Resume
        </button>
      </div>
    </Html>
  )
}
