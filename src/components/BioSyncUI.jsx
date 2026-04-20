import useStore from '../store/useStore'

const PHASE_META = [
  {
    id: 0,
    emoji: '🏛️',
    label: 'The Threshold',
    desc: 'Dusk · Entrance',
    color: '#c8a0e0',
    dot: '#aa55ff',
  },
  {
    id: 1,
    emoji: '💎',
    label: 'Career Avenue',
    desc: 'Day · Skills & Links',
    color: '#00e5ff',
    dot: '#00b8d9',
  },
  {
    id: 2,
    emoji: '🌊',
    label: 'The Sanctuary',
    desc: 'Night · Memory Lake',
    color: '#5588ff',
    dot: '#3366ee',
  },
  {
    id: 3,
    emoji: '☕',
    label: 'Zero-G Café',
    desc: 'Dawn · Projects',
    color: '#ffaa44',
    dot: '#ff8800',
  },
]

export default function BioSyncUI() {
  const scrollPhase = useStore(s => s.scrollPhase)
  const meta = PHASE_META[scrollPhase] ?? PHASE_META[0]

  return (
    <div className="absolute top-5 left-5 z-50 select-none" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Phase Compass Card ─────────────────────────────── */}
      <div
        className="glass p-4 min-w-[210px] transition-all duration-700"
        style={{ boxShadow: `0 0 24px ${meta.dot}55` }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex h-3 w-3">
            <span
              className="status-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: meta.dot }}
            />
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: meta.dot }} />
          </div>
          <span className="text-white/40 text-[10px] font-semibold tracking-widest uppercase">
            Khushi's World
          </span>
        </div>

        {/* Phase info */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <p className="font-bold text-sm neon-text" style={{ color: meta.color }}>
              {meta.label}
            </p>
            <p className="text-white/40 text-[11px]">{meta.desc}</p>
          </div>
        </div>

        {/* Phase stepper dots */}
        <div className="flex gap-2 mt-3 items-center justify-center">
          {PHASE_META.map((p) => (
            <div
              key={p.id}
              className="rounded-full transition-all duration-500"
              style={{
                width:   scrollPhase === p.id ? '20px' : '8px',
                height:  '8px',
                background: scrollPhase === p.id ? p.dot : '#ffffff22',
                boxShadow: scrollPhase === p.id ? `0 0 8px ${p.dot}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Scroll hint */}
      <p className="text-white/25 text-[10px] mt-2 ml-1 tracking-wide">
        scroll ↓ to walk · drag to look
      </p>
    </div>
  )
}
