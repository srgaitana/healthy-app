// /store/useStore.ts
import { create } from 'zustand'

interface AppState {
  isProfessional: boolean
  toggleProfessional: () => void
}

export const useStore = create<AppState>((set) => ({
  isProfessional: false,
  toggleProfessional: () => set((state) => ({ isProfessional: !state.isProfessional })),
}))