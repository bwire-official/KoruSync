import { create } from 'zustand'

interface OnboardingState {
  username: string
  timezone: string
  pillars: string[]
  setUsername: (username: string) => void
  setTimezone: (timezone: string) => void
  setPillars: (pillars: string[]) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  username: '',
  timezone: '',
  pillars: [],
  setUsername: (username) => set({ username }),
  setTimezone: (timezone) => set({ timezone }),
  setPillars: (pillars) => set({ pillars }),
  reset: () => set({ username: '', timezone: '', pillars: [] }),
})) 