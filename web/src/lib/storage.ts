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

const STORAGE_KEY_V1 = 'isc-curriculum-progress-v1'
const STORAGE_KEY_V2 = 'isc-curriculum-progress-v2'
/** Bumped when client progress shape or click-critical behavior changes. */
const STORAGE_KEY = 'isc-curriculum-progress-v3'

export type LearningPathId = 'fluency' | 'implementation'
export type DrillRating = 'knew' | 'needs-work'

/** Per-path progress bucket (shared shape for fluency + implementation). */
export type PathProgress = {
  completedItems: string[]
  completedTracker: string[]
  lastRoute: string
  drillRatings: Record<string, DrillRating>
  labChecks: Record<string, string[]>
  labNotes: Record<string, string>
  versioningCorrect: string[]
  filterCorrect: string[]
}

export type DualProgressState = {
  activePath: LearningPathId
  pathChosen: boolean
  fluency: PathProgress
  implementation: PathProgress
}

export const defaultPathProgress = (): PathProgress => ({
  completedItems: [],
  completedTracker: [],
  lastRoute: '/',
  drillRatings: {},
  labChecks: {},
  labNotes: {},
  versioningCorrect: [],
  filterCorrect: [],
})

export const defaultDualProgress = (): DualProgressState => ({
  activePath: 'fluency',
  pathChosen: false,
  fluency: defaultPathProgress(),
  implementation: defaultPathProgress(),
})

function migrateV1(raw: string): DualProgressState | null {
  try {
    const v1 = JSON.parse(raw) as {
      completedPhases?: string[]
      completedTracker?: string[]
      lastRoute?: string
      drillRatings?: Record<string, DrillRating>
      labChecks?: Record<string, string[]>
      labNotes?: Record<string, string>
      versioningCorrect?: string[]
      filterCorrect?: string[]
    }
    const dual = defaultDualProgress()
    dual.pathChosen = true
    dual.activePath = 'fluency'
    dual.fluency = {
      ...defaultPathProgress(),
      completedItems: v1.completedPhases ?? [],
      completedTracker: v1.completedTracker ?? [],
      lastRoute: v1.lastRoute ?? '/',
      drillRatings: v1.drillRatings ?? {},
      labChecks: v1.labChecks ?? {},
      labNotes: v1.labNotes ?? {},
      versioningCorrect: v1.versioningCorrect ?? [],
      filterCorrect: v1.filterCorrect ?? [],
    }
    return dual
  } catch {
    return null
  }
}

function normalizeDual(parsed: DualProgressState): DualProgressState {
  return {
    ...defaultDualProgress(),
    ...parsed,
    fluency: { ...defaultPathProgress(), ...parsed.fluency },
    implementation: { ...defaultPathProgress(), ...parsed.implementation },
  }
}

export function loadDualProgress(
  adapter: StorageAdapter = localStorageAdapter,
): DualProgressState {
  const current = adapter.getItem(STORAGE_KEY)
  if (current) {
    try {
      return normalizeDual(JSON.parse(current) as DualProgressState)
    } catch {
      /* fall through */
    }
  }
  const v2 = adapter.getItem(STORAGE_KEY_V2)
  if (v2) {
    try {
      const migrated = normalizeDual(JSON.parse(v2) as DualProgressState)
      // Force path chooser once after the click-freeze fix so users aren't stuck
      // behind a half-rendered shell from a prior bad session.
      migrated.pathChosen = false
      saveDualProgress(migrated, adapter)
      adapter.removeItem(STORAGE_KEY_V2)
      return migrated
    } catch {
      /* fall through */
    }
  }
  const v1 = adapter.getItem(STORAGE_KEY_V1)
  if (v1) {
    const migrated = migrateV1(v1)
    if (migrated) {
      migrated.pathChosen = false
      saveDualProgress(migrated, adapter)
      return migrated
    }
  }
  return defaultDualProgress()
}

export function saveDualProgress(
  state: DualProgressState,
  adapter: StorageAdapter = localStorageAdapter,
): void {
  adapter.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetDualProgress(
  adapter: StorageAdapter = localStorageAdapter,
): DualProgressState {
  const fresh = defaultDualProgress()
  saveDualProgress(fresh, adapter)
  adapter.removeItem(STORAGE_KEY_V1)
  adapter.removeItem(STORAGE_KEY_V2)
  return fresh
}

export function resetActivePathProgress(
  state: DualProgressState,
  adapter: StorageAdapter = localStorageAdapter,
): DualProgressState {
  const next: DualProgressState = {
    ...state,
    [state.activePath]: defaultPathProgress(),
  }
  saveDualProgress(next, adapter)
  return next
}
