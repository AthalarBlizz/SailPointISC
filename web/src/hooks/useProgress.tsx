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
  setLastRoute: (route: string) => void
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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [dual, setDual] = useState<DualProgressState>(() => loadDualProgress())

  useEffect(() => {
    saveDualProgress(dual)
  }, [dual])

  const update = useCallback((fn: (prev: DualProgressState) => DualProgressState) => {
    setDual((prev) => fn(prev))
  }, [])

  const value = useMemo<ProgressContextValue>(() => {
    const progress = dual[dual.activePath]
    return {
      dual,
      activePath: dual.activePath,
      pathChosen: dual.pathChosen,
      progress,
      setActivePath: (path) =>
        update((d) => ({ ...d, activePath: path, pathChosen: true })),
      choosePath: (path) =>
        update((d) => ({ ...d, activePath: path, pathChosen: true })),
      setLastRoute: (route) =>
        update((d) => updateActive(d, (p) => ({ ...p, lastRoute: route }))),
      toggleItemComplete: (itemId) =>
        update((d) =>
          updateActive(d, (p) => {
            const has = p.completedItems.includes(itemId)
            return {
              ...p,
              completedItems: has
                ? p.completedItems.filter((id) => id !== itemId)
                : [...p.completedItems, itemId],
            }
          }),
        ),
      toggleTracker: (id) =>
        update((d) =>
          updateActive(d, (p) => {
            const has = p.completedTracker.includes(id)
            return {
              ...p,
              completedTracker: has
                ? p.completedTracker.filter((x) => x !== id)
                : [...p.completedTracker, id],
            }
          }),
        ),
      setDrillRating: (drillId, rating) =>
        update((d) =>
          updateActive(d, (p) => ({
            ...p,
            drillRatings: { ...p.drillRatings, [drillId]: rating },
          })),
        ),
      toggleLabCheck: (labId, item) =>
        update((d) =>
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
        ),
      setLabNotes: (labId, notes) =>
        update((d) =>
          updateActive(d, (p) => ({
            ...p,
            labNotes: { ...p.labNotes, [labId]: notes },
          })),
        ),
      markVersioningCorrect: (itemId) =>
        update((d) =>
          updateActive(d, (p) => ({
            ...p,
            versioningCorrect: p.versioningCorrect.includes(itemId)
              ? p.versioningCorrect
              : [...p.versioningCorrect, itemId],
          })),
        ),
      markFilterCorrect: (itemId) =>
        update((d) =>
          updateActive(d, (p) => ({
            ...p,
            filterCorrect: p.filterCorrect.includes(itemId)
              ? p.filterCorrect
              : [...p.filterCorrect, itemId],
          })),
        ),
      resetActivePath: () => setDual((d) => resetActivePathProgress(d)),
      resetAll: () => setDual(resetDualProgress()),
    }
  }, [dual, update])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
