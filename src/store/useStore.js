import { create } from 'zustand'

/**
 * Bio-Sync Engine — Global Zustand Store
 * khushiStatus drives environment lighting, fog density, and effects.
 */
const useStore = create((set) => ({
  khushiStatus: 'chilling', // 'coding' | 'sleeping' | 'chilling'
  setStatus: (status) => set({ khushiStatus: status }),
}))

export default useStore
