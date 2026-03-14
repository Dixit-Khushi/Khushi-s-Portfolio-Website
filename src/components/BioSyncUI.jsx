import useStore from '../store/useStore'

const STATUS_META = {
  coding: {
    emoji: '💻',
    label: 'Coding Mode',
    desc: 'Khushi is in the zone',
    color: 'text-cyan-300',
    dot: 'bg-cyan-400',
    ring: 'shadow-cyan-500/60',
  },
  sleeping: {
    emoji: '🌙',
    label: 'Sleeping',
    desc: 'Do not disturb...',
    color: 'text-purple-300',
    dot: 'bg-purple-500',
    ring: 'shadow-purple-500/60',
  },
  chilling: {
    emoji: '🧡',
    label: 'Chilling',
    desc: 'Good vibes only',
    color: 'text-orange-300',
    dot: 'bg-orange-400',
    ring: 'shadow-orange-500/60',
  },
}

const STATUSES = ['coding', 'sleeping', 'chilling']

export default function BioSyncUI() {
  const { khushiStatus, setStatus } = useStore()
  const meta = STATUS_META[khushiStatus]

  return (
    <div className="absolute top-5 left-5 z-50 select-none">
      {/* Main card */}
      <div
        className={`glass p-4 min-w-[200px] shadow-lg ${meta.ring} transition-all duration-700`}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          {/* Status ping dot */}
          <div className="relative flex h-3 w-3">
            <span className={`status-ping absolute inline-flex h-full w-full rounded-full ${meta.dot} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${meta.dot}`} />
          </div>
          <span className="text-white/50 text-[10px] font-semibold tracking-widest uppercase">
            Bio-Sync
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <p className={`font-bold text-sm ${meta.color} neon-text`}>{meta.label}</p>
            <p className="text-white/40 text-[11px]">{meta.desc}</p>
          </div>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-1 mt-3">
          {STATUSES.map((s) => (
            <button
              key={s}
              id={`bio-sync-${s}`}
              onClick={() => setStatus(s)}
              className={`
                flex-1 text-[10px] py-1 rounded-lg font-semibold uppercase tracking-wide
                transition-all duration-300 cursor-pointer
                ${khushiStatus === s
                  ? `${meta.dot} text-black shadow-md`
                  : 'bg-white/10 text-white/50 hover:bg-white/20'}
              `}
            >
              {STATUS_META[s].emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <p className="text-white/25 text-[10px] mt-2 ml-1 tracking-wide">
        scroll ↓ to walk · drag to look
      </p>
    </div>
  )
}
