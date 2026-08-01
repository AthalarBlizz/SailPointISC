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
  loadProgress,
  saveProgress,
  resetProgress,
  type ProgressState,
  type DrillRating,
} from '../lib/storage'

type ProgressContextValue = {
  progress: ProgressState
  setLastRoute: (route: string) => void
  togglePhaseComplete: (phaseId: string) => void
  toggleTracker: (id: string) => void
  setDrillRating: (drillId: string, rating: DrillRating) => void
  toggleLabCheck: (labId: string, item: string) => void
  setLabNotes: (labId: string, notes: string) => void
  markVersioningCorrect: (itemId: string) => void
  markFilterCorrect: (itemId: string) => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const update = useCallback((fn: (prev: ProgressState) => ProgressState) => {
    setProgress((prev) => fn(prev))
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      setLastRoute: (route) => update((p) => ({ ...p, lastRoute: route })),
      togglePhaseComplete: (phaseId) =>
        update((p) => {
          const has = p.completedPhases.includes(phaseId)
          return {
            ...p,
            completedPhases: has
              ? p.completedPhases.filter((id) => id !== phaseId)
              : [...p.completedPhases, phaseId],
          }
        }),
      toggleTracker: (id) =>
        update((p) => {
          const has = p.completedTracker.includes(id)
          return {
            ...p,
            completedTracker: has
              ? p.completedTracker.filter((x) => x !== id)
              : [...p.completedTracker, id],
          }
        }),
      setDrillRating: (drillId, rating) =>
        update((p) => ({
          ...p,
          drillRatings: { ...p.drillRatings, [drillId]: rating },
        })),
      toggleLabCheck: (labId, item) =>
        update((p) => {
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
      setLabNotes: (labId, notes) =>
        update((p) => ({
          ...p,
          labNotes: { ...p.labNotes, [labId]: notes },
        })),
      markVersioningCorrect: (itemId) =>
        update((p) => ({
          ...p,
          versioningCorrect: p.versioningCorrect.includes(itemId)
            ? p.versioningCorrect
            : [...p.versioningCorrect, itemId],
        })),
      markFilterCorrect: (itemId) =>
        update((p) => ({
          ...p,
          filterCorrect: p.filterCorrect.includes(itemId)
            ? p.filterCorrect
            : [...p.filterCorrect, itemId],
        })),
      reset: () => setProgress(resetProgress()),
    }),
    [progress, update],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
