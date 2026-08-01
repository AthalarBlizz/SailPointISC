import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import {
  loadDualProgress,
  saveDualProgress,
  resetDualProgress,
  resetActivePathProgress,
  type DualProgressState,
  type PathProgress,
  type LearningPathId,
  type DrillRating,
} from '../lib/storage'

type ProgressContextValue = {
  dual: DualProgressState
  activePath: LearningPathId
  pathChosen: boolean
  progress: PathProgress
  setActivePath: (path: LearningPathId) => void
  choosePath: (path: LearningPathId) => void
  /** Persist continue URL without triggering React updates on every navigation. */
  rememberRoute: (route: string) => void
  getContinueRoute: (fallback: string) => string
  toggleItemComplete: (itemId: string) => void
  toggleTracker: (id: string) => void
  setDrillRating: (drillId: string, rating: DrillRating) => void
  toggleLabCheck: (labId: string, item: string) => void
  setLabNotes: (labId: string, notes: string) => void
  markVersioningCorrect: (itemId: string) => void
  markFilterCorrect: (itemId: string) => void
  resetActivePath: () => void
  resetAll: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function updateActive(
  dual: DualProgressState,
  fn: (p: PathProgress) => PathProgress,
): DualProgressState {
  const key = dual.activePath
  return { ...dual, [key]: fn(dual[key]) }
}

const ROUTE_STORAGE_KEY = 'isc-curriculum-progress-v3'

function persistRoute(path: LearningPathId, route: string) {
  try {
    const raw = localStorage.getItem(ROUTE_STORAGE_KEY)
    if (!raw) return
    const dual = JSON.parse(raw) as DualProgressState
    if (!dual[path]) return
    if (dual[path].lastRoute === route) return
    dual[path].lastRoute = route
    localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(dual))
  } catch {
    /* ignore */
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [dual, setDual] = useState<DualProgressState>(() => loadDualProgress())

  useEffect(() => {
    saveDualProgress(dual)
  }, [dual])

  const setActivePath = useCallback((path: LearningPathId) => {
    setDual((d) => ({ ...d, activePath: path, pathChosen: true }))
  }, [])

  const choosePath = useCallback((path: LearningPathId) => {
    setDual((d) => ({ ...d, activePath: path, pathChosen: true }))
  }, [])

  const rememberRoute = useCallback(
    (route: string) => {
      persistRoute(dual.activePath, route)
    },
    [dual.activePath],
  )

  const getContinueRoute = useCallback(
    (fallback: string) => {
      const route = dual[dual.activePath].lastRoute
      return route && route !== '/' ? route : fallback
    },
    [dual],
  )

  const toggleItemComplete = useCallback((itemId: string) => {
    setDual((d) =>
      updateActive(d, (p) => {
        const has = p.completedItems.includes(itemId)
        return {
          ...p,
          completedItems: has
            ? p.completedItems.filter((id) => id !== itemId)
            : [...p.completedItems, itemId],
        }
      }),
    )
  }, [])

  const toggleTracker = useCallback((id: string) => {
    setDual((d) =>
      updateActive(d, (p) => {
        const has = p.completedTracker.includes(id)
        return {
          ...p,
          completedTracker: has
            ? p.completedTracker.filter((x) => x !== id)
            : [...p.completedTracker, id],
        }
      }),
    )
  }, [])

  const setDrillRating = useCallback((drillId: string, rating: DrillRating) => {
    setDual((d) =>
      updateActive(d, (p) => ({
        ...p,
        drillRatings: { ...p.drillRatings, [drillId]: rating },
      })),
    )
  }, [])

  const toggleLabCheck = useCallback((labId: string, item: string) => {
    setDual((d) =>
      updateActive(d, (p) => {
        const current = p.labChecks[labId] ?? []
        const has = current.includes(item)
        return {
          ...p,
          labChecks: {
            ...p.labChecks,
            [labId]: has ? current.filter((x) => x !== item) : [...current, item],
          },
        }
      }),
    )
  }, [])

  const setLabNotes = useCallback((labId: string, notes: string) => {
    setDual((d) =>
      updateActive(d, (p) => ({
        ...p,
        labNotes: { ...p.labNotes, [labId]: notes },
      })),
    )
  }, [])

  const markVersioningCorrect = useCallback((itemId: string) => {
    setDual((d) =>
      updateActive(d, (p) => ({
        ...p,
        versioningCorrect: p.versioningCorrect.includes(itemId)
          ? p.versioningCorrect
          : [...p.versioningCorrect, itemId],
      })),
    )
  }, [])

  const markFilterCorrect = useCallback((itemId: string) => {
    setDual((d) =>
      updateActive(d, (p) => ({
        ...p,
        filterCorrect: p.filterCorrect.includes(itemId)
          ? p.filterCorrect
          : [...p.filterCorrect, itemId],
      })),
    )
  }, [])

  const resetActivePath = useCallback(() => {
    setDual((d) => resetActivePathProgress(d))
  }, [])

  const resetAll = useCallback(() => {
    setDual(resetDualProgress())
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      dual,
      activePath: dual.activePath,
      pathChosen: dual.pathChosen,
      progress: dual[dual.activePath],
      setActivePath,
      choosePath,
      rememberRoute,
      getContinueRoute,
      toggleItemComplete,
      toggleTracker,
      setDrillRating,
      toggleLabCheck,
      setLabNotes,
      markVersioningCorrect,
      markFilterCorrect,
      resetActivePath,
      resetAll,
    }),
    [
      dual,
      setActivePath,
      choosePath,
      rememberRoute,
      getContinueRoute,
      toggleItemComplete,
      toggleTracker,
      setDrillRating,
      toggleLabCheck,
      setLabNotes,
      markVersioningCorrect,
      markFilterCorrect,
      resetActivePath,
      resetAll,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
