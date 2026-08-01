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

/** Portable backup envelope — safe to save to Files / iCloud / Drive. */
export const PROGRESS_EXPORT_FORMAT = 'isc-curriculum-progress'
export const PROGRESS_EXPORT_VERSION = 1

export type ProgressExportEnvelope = {
  format: typeof PROGRESS_EXPORT_FORMAT
  formatVersion: number
  exportedAt: string
  app: string
  data: DualProgressState
}

export function buildProgressExport(state: DualProgressState): ProgressExportEnvelope {
  return {
    format: PROGRESS_EXPORT_FORMAT,
    formatVersion: PROGRESS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'SailPoint ISC Developer Curriculum',
    data: normalizeDual(state),
  }
}

export function progressExportFilename(exportedAt = new Date()): string {
  const stamp = exportedAt.toISOString().slice(0, 10)
  return `isc-curriculum-progress-${stamp}.json`
}

/**
 * Parse and validate a progress backup (envelope or raw DualProgressState).
 * Returns normalized state or a human-readable error string.
 */
export function parseProgressImport(raw: string): DualProgressState | string {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return 'That file is not valid JSON.'
  }

  if (!parsed || typeof parsed !== 'object') {
    return 'That file does not look like a progress backup.'
  }

  const obj = parsed as Record<string, unknown>

  // Envelope from this app
  if (obj.format === PROGRESS_EXPORT_FORMAT && obj.data && typeof obj.data === 'object') {
    return normalizeDual(obj.data as DualProgressState)
  }

  // Raw dual progress (or older backups without envelope)
  if (
    obj.fluency &&
    typeof obj.fluency === 'object' &&
    obj.implementation &&
    typeof obj.implementation === 'object'
  ) {
    return normalizeDual(obj as unknown as DualProgressState)
  }

  // Legacy single-path v1 shape
  if (Array.isArray(obj.completedPhases) || Array.isArray(obj.completedTracker)) {
    const migrated = migrateV1(JSON.stringify(obj))
    if (migrated) return migrated
  }

  return 'Unrecognized progress file. Export a backup from this curriculum app and try again.'
}

/**
 * Save a progress backup: Web Share (Files/iCloud) when available, else download.
 */
export async function shareOrDownloadProgress(
  state: DualProgressState,
): Promise<'shared' | 'downloaded'> {
  const envelope = buildProgressExport(state)
  const filename = progressExportFilename(new Date(envelope.exportedAt))
  const text = JSON.stringify(envelope, null, 2)
  const file = new File([text], filename, { type: 'application/json' })

  try {
    if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'ISC curriculum progress',
        text: 'SailPoint ISC Developer Curriculum progress backup',
      })
      return 'shared'
    }
  } catch (err) {
    // User cancelled share sheet — don't fall through to a duplicate download.
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err
    }
  }

  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return 'downloaded'
}
