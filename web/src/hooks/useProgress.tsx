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
  parseProgressImport,
  shareOrDownloadProgress,
  STORAGE_KEY,
  type DualProgressState,
  type PathProgress,
  type LearningPathId,
  type DrillRating,
} from '../lib/storage'
import { applyGameEvent, type GameEvent } from '../lib/gamification'
import { labs } from '../content/labs'
import { badges } from '../content/badges'

export type ToastItem = {
  id: string
  kind: 'xp' | 'badge' | 'clear'
  message: string
}

type ProgressContextValue = {
  dual: DualProgressState
  activePath: LearningPathId
  pathChosen: boolean
  progress: PathProgress
  toasts: ToastItem[]
  dismissToast: (id: string) => void
  setActivePath: (path: LearningPathId) => void
  choosePath: (path: LearningPathId) => void
  rememberRoute: (route: string) => void
  getContinueRoute: (fallback: string) => string
  toggleItemComplete: (itemId: string) => void
  toggleTracker: (id: string) => void
  setDrillRating: (drillId: string, rating: DrillRating) => void
  toggleLabCheck: (labId: string, item: string) => void
  setLabNotes: (labId: string, notes: string) => void
  markVersioningCorrect: (itemId: string) => void
  markFilterCorrect: (itemId: string) => void
  markQuizCorrect: (quizId: string) => void
  markDecisionCorrect: (scenarioId: string) => void
  tryClearUnit: (unitId: string, sections: { blocks: { type: string; id?: string }[] }[], checkpoints: { id: string }[]) => boolean
  resetActivePath: () => void
  resetAll: () => void
  exportProgress: () => Promise<'shared' | 'downloaded'>
  importProgress: (raw: string) => string | null
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

function updateActive(
  dual: DualProgressState,
  fn: (p: PathProgress) => PathProgress,
): DualProgressState {
  const key = dual.activePath
  return { ...dual, [key]: fn(dual[key]) }
}

function persistRoute(path: LearningPathId, route: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const dual = JSON.parse(raw) as DualProgressState
    if (!dual[path]) return
    if (dual[path].lastRoute === route) return
    dual[path].lastRoute = route
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dual))
  } catch {
    /* ignore */
  }
}

function pushToasts(
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>,
  xpGained: number,
  newBadges: string[],
  cleared?: string,
) {
  const items: ToastItem[] = []
  if (xpGained > 0) {
    items.push({
      id: `xp-${Date.now()}`,
      kind: 'xp',
      message: `+${xpGained} XP`,
    })
  }
  for (const b of newBadges) {
    items.push({
      id: `badge-${b}-${Date.now()}`,
      kind: 'badge',
      message: `Badge unlocked: ${badges.find((x) => x.id === b)?.title ?? b}`,
    })
  }
  if (cleared) {
    items.push({
      id: `clear-${cleared}-${Date.now()}`,
      kind: 'clear',
      message: `Unit cleared: ${cleared}`,
    })
  }
  if (items.length) {
    setToasts((t) => [...t, ...items].slice(-5))
  }
}

function labFullyChecked(progress: PathProgress, labId: string): boolean {
  const lab = labs.find((l) => l.id === labId)
  if (!lab) return false
  const checks = progress.labChecks[labId] ?? []
  if (lab.kind === 'capstone') {
    return lab.checklist.length > 0 && lab.checklist.every((c) => checks.includes(c))
  }
  if (lab.kind === 'implementation') {
    return lab.steps.length > 0 && lab.steps.every((c) => checks.includes(c))
  }
  return false
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [dual, setDual] = useState<DualProgressState>(() => loadDualProgress())
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    saveDualProgress(dual)
  }, [dual])

  const applyEvent = useCallback((event: GameEvent) => {
    setDual((d) => {
      const path = d.activePath
      const result = applyGameEvent(d[path], path, event)
      queueMicrotask(() => {
        pushToasts(
          setToasts,
          result.xpGained,
          result.newBadges,
          event.type === 'unitCleared' ? event.unitId : undefined,
        )
      })
      return { ...d, [path]: result.progress }
    })
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

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
    setDual((d) => {
      const path = d.activePath
      const prev = d[path].drillRatings[drillId]
      const result = applyGameEvent(d[path], path, {
        type: 'drill',
        drillId,
        rating,
        prev,
      })
      queueMicrotask(() => pushToasts(setToasts, result.xpGained, result.newBadges))
      return { ...d, [path]: result.progress }
    })
  }, [])

  const toggleLabCheck = useCallback((labId: string, item: string) => {
    setDual((d) => {
      const path = d.activePath
      let p = d[path]
      const current = p.labChecks[labId] ?? []
      const has = current.includes(item)
      p = {
        ...p,
        labChecks: {
          ...p.labChecks,
          [labId]: has ? current.filter((x) => x !== item) : [...current, item],
        },
      }
      if (!has && labFullyChecked(p, labId)) {
        const result = applyGameEvent(p, path, { type: 'labComplete', labId })
        queueMicrotask(() => pushToasts(setToasts, result.xpGained, result.newBadges))
        p = result.progress
      }
      return { ...d, [path]: p }
    })
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
    applyEvent({ type: 'versioning', itemId })
  }, [applyEvent])

  const markFilterCorrect = useCallback((itemId: string) => {
    applyEvent({ type: 'filter', itemId })
  }, [applyEvent])

  const markQuizCorrect = useCallback((quizId: string) => {
    applyEvent({ type: 'quiz', quizId })
  }, [applyEvent])

  const markDecisionCorrect = useCallback((scenarioId: string) => {
    applyEvent({ type: 'decision', scenarioId })
  }, [applyEvent])

  const tryClearUnit = useCallback(
    (
      unitId: string,
      sections: { blocks: { type: string; id?: string }[] }[],
      checkpoints: { id: string }[],
    ) => {
      let cleared = false
      setDual((d) => {
        const path = d.activePath
        const p = d[path]
        const quizIds: string[] = []
        for (const s of sections) {
          for (const b of s.blocks) {
            if (b.type === 'quiz' && b.id) quizIds.push(b.id)
          }
        }
        const quizzesOk =
          quizIds.length === 0 || quizIds.every((id) => p.sectionChecks.includes(id))
        const drillsOk =
          checkpoints.length === 0 ||
          checkpoints.every((c) => p.drillRatings[c.id] != null)
        if (!quizzesOk || !drillsOk || p.clearedUnits.includes(unitId)) {
          return d
        }
        const result = applyGameEvent(p, path, { type: 'unitCleared', unitId })
        cleared = true
        queueMicrotask(() =>
          pushToasts(setToasts, result.xpGained, result.newBadges, unitId),
        )
        return { ...d, [path]: result.progress }
      })
      return cleared
    },
    [],
  )

  const resetActivePath = useCallback(() => {
    setDual((d) => resetActivePathProgress(d))
  }, [])

  const resetAll = useCallback(() => {
    setDual(resetDualProgress())
  }, [])

  const exportProgress = useCallback(async () => {
    const latest = loadDualProgress()
    const merged: DualProgressState = {
      ...dual,
      fluency: {
        ...dual.fluency,
        lastRoute: latest.fluency?.lastRoute || dual.fluency.lastRoute,
      },
      implementation: {
        ...dual.implementation,
        lastRoute: latest.implementation?.lastRoute || dual.implementation.lastRoute,
      },
    }
    return shareOrDownloadProgress(merged)
  }, [dual])

  const importProgress = useCallback((raw: string) => {
    const result = parseProgressImport(raw)
    if (typeof result === 'string') return result
    saveDualProgress(result)
    setDual(result)
    return null
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      dual,
      activePath: dual.activePath,
      pathChosen: dual.pathChosen,
      progress: dual[dual.activePath],
      toasts,
      dismissToast,
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
      markQuizCorrect,
      markDecisionCorrect,
      tryClearUnit,
      resetActivePath,
      resetAll,
      exportProgress,
      importProgress,
    }),
    [
      dual,
      toasts,
      dismissToast,
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
      markQuizCorrect,
      markDecisionCorrect,
      tryClearUnit,
      resetActivePath,
      resetAll,
      exportProgress,
      importProgress,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
