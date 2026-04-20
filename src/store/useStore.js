import { create } from 'zustand'

/**
 * Global store for Khushi's World.
 * scrollPhase (0–3) is set by WalkingCamera based on scroll progress.
 */
const useStore = create((set) => ({
  khushiStatus: 'chilling',         // 'coding' | 'sleeping' | 'chilling'
  setStatus:    (status) => set({ khushiStatus: status }),
  scrollPhase:  0,                  // 0=Threshold 1=CareerAve 2=Sanctuary 3=Café
  setScrollPhase: (p) => set({ scrollPhase: p }),
}))

export default useStore
