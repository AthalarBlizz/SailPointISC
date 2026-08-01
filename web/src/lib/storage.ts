/**
 * Storage adapter — localStorage now; swap for Capacitor Preferences later.
 */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const localStorageAdapter: StorageAdapter = {
  getItem(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private mode / quota */
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

const STORAGE_KEY = 'isc-curriculum-progress-v1'

export type DrillRating = 'knew' | 'needs-work'

export type ProgressState = {
  completedPhases: string[]
  completedTracker: string[]
  lastRoute: string
  drillRatings: Record<string, DrillRating>
  labChecks: Record<string, string[]>
  labNotes: Record<string, string>
  versioningCorrect: string[]
  filterCorrect: string[]
}

export const defaultProgress = (): ProgressState => ({
  completedPhases: [],
  completedTracker: [],
  lastRoute: '/',
  drillRatings: {},
  labChecks: {},
  labNotes: {},
  versioningCorrect: [],
  filterCorrect: [],
})

export function loadProgress(adapter: StorageAdapter = localStorageAdapter): ProgressState {
  const raw = adapter.getItem(STORAGE_KEY)
  if (!raw) return defaultProgress()
  try {
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(
  state: ProgressState,
  adapter: StorageAdapter = localStorageAdapter,
): void {
  adapter.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetProgress(adapter: StorageAdapter = localStorageAdapter): ProgressState {
  const fresh = defaultProgress()
  saveProgress(fresh, adapter)
  return fresh
}
