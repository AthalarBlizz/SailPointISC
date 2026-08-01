import type { LearningPathId, PathProgress } from './storage'
import type { Module, Phase, Section } from '../content/types'
import { badges } from '../content/badges'
import { labs } from '../content/labs'
import { phases } from '../content/phases'
import { implementationModules, tracks } from '../content/implementation'

export const XP = {
  quizCorrect: 10,
  drillKnew: 5,
  drillNeedsWork: 1,
  versioningItem: 8,
  filterItem: 8,
  labChecklistComplete: 25,
  decisionCorrect: 15,
  unitCleared: 40,
  streakDayBonus: 5,
} as const

export type RankId = 'novice' | 'practitioner' | 'fluent' | 'senior' | 'architect'

export type RankDef = {
  id: RankId
  label: string
  minXp: number
}

/** Path A uses Fluent; Path B uses Builder at the same threshold. */
export function ranksForPath(path: LearningPathId): RankDef[] {
  const midLabel = path === 'fluency' ? 'Fluent' : 'Builder'
  return [
    { id: 'novice', label: 'Novice', minXp: 0 },
    { id: 'practitioner', label: 'Practitioner', minXp: 150 },
    { id: 'fluent', label: midLabel, minXp: 400 },
    { id: 'senior', label: 'Senior', minXp: 900 },
    { id: 'architect', label: 'Architect', minXp: 1600 },
  ]
}

export function rankFromXp(xp: number, path: LearningPathId): RankDef {
  const ranks = ranksForPath(path)
  let current = ranks[0]
  for (const r of ranks) {
    if (xp >= r.minXp) current = r
  }
  return current
}

export function nextRank(xp: number, path: LearningPathId): RankDef | null {
  const ranks = ranksForPath(path)
  const current = rankFromXp(xp, path)
  const idx = ranks.findIndex((r) => r.id === current.id)
  return idx < ranks.length - 1 ? ranks[idx + 1] : null
}

export function xpProgressToNext(xp: number, path: LearningPathId): {
  current: RankDef
  next: RankDef | null
  intoRank: number
  span: number
  ratio: number
} {
  const current = rankFromXp(xp, path)
  const next = nextRank(xp, path)
  if (!next) {
    return { current, next: null, intoRank: 0, span: 1, ratio: 1 }
  }
  const intoRank = xp - current.minXp
  const span = next.minXp - current.minXp
  return { current, next, intoRank, span, ratio: Math.min(1, intoRank / span) }
}

export function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function daysBetweenUtc(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

/**
 * Apply daily streak + first-activity bonus. Returns updated progress
 * and whether a streak bonus was awarded.
 */
export function touchDailyActivity(progress: PathProgress, today = utcDateString()): {
  progress: PathProgress
  streakBonus: boolean
} {
  const last = progress.lastActiveDate
  if (last === today) {
    return { progress, streakBonus: false }
  }
  let streakDays = 1
  if (last) {
    const gap = daysBetweenUtc(last, today)
    streakDays = gap === 1 ? progress.streakDays + 1 : 1
  }
  return {
    progress: {
      ...progress,
      lastActiveDate: today,
      streakDays,
      xp: progress.xp + XP.streakDayBonus,
    },
    streakBonus: true,
  }
}

export function quizIdsInSections(sections: Section[]): string[] {
  const ids: string[] = []
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type === 'quiz') ids.push(block.id)
    }
  }
  return ids
}

export function unitQuizzesPassed(progress: PathProgress, sections: Section[]): boolean {
  const required = quizIdsInSections(sections)
  if (required.length === 0) return true
  return required.every((id) => progress.sectionChecks.includes(id))
}

export function unitCheckpointsRated(
  progress: PathProgress,
  checkpoints: { id: string }[],
): boolean {
  if (checkpoints.length === 0) return true
  return checkpoints.every((c) => progress.drillRatings[c.id] != null)
}

export function canClearUnit(
  progress: PathProgress,
  sections: Section[],
  checkpoints: { id: string }[],
): boolean {
  return unitQuizzesPassed(progress, sections) && unitCheckpointsRated(progress, checkpoints)
}

/** Sequential unlock: first unit always open; later units need prior cleared. */
export function isPhaseUnlocked(phaseId: string, progress: PathProgress): boolean {
  const idx = phases.findIndex((p) => p.id === phaseId)
  if (idx <= 0) return true
  const prev = phases[idx - 1]
  return progress.clearedUnits.includes(prev.id)
}

export function isModuleUnlocked(moduleId: string, progress: PathProgress): boolean {
  const idx = implementationModules.findIndex((m) => m.id === moduleId)
  if (idx <= 0) return true
  const prev = implementationModules[idx - 1]
  return progress.clearedUnits.includes(prev.id)
}

export function nextUnlockHint(
  path: LearningPathId,
  progress: PathProgress,
): { kind: 'phase' | 'module'; unit: Phase | Module } | null {
  if (path === 'fluency') {
    for (const p of phases) {
      if (!progress.clearedUnits.includes(p.id) && isPhaseUnlocked(p.id, progress)) {
        return { kind: 'phase', unit: p }
      }
    }
    return null
  }
  for (const m of implementationModules) {
    if (!progress.clearedUnits.includes(m.id) && isModuleUnlocked(m.id, progress)) {
      return { kind: 'module', unit: m }
    }
  }
  return null
}

/** Activity %: cleared units + lab mastery signals. */
export function activityPercent(path: LearningPathId, progress: PathProgress): number {
  const units = path === 'fluency' ? phases : implementationModules
  const unitScore =
    units.length === 0
      ? 0
      : units.filter((u) => progress.clearedUnits.includes(u.id)).length / units.length

  const versioningLab = labs.find((l) => l.kind === 'versioning')
  const filterLab = labs.find((l) => l.kind === 'filters')
  let labParts = 0
  let labDenom = 0
  if (versioningLab && versioningLab.kind === 'versioning') {
    labDenom += 1
    labParts +=
      versioningLab.items.length === 0
        ? 0
        : progress.versioningCorrect.length / versioningLab.items.length
  }
  if (filterLab && filterLab.kind === 'filters') {
    labDenom += 1
    labParts +=
      filterLab.items.length === 0
        ? 0
        : progress.filterCorrect.length / filterLab.items.length
  }
  const labScore = labDenom === 0 ? 0 : labParts / labDenom

  const pct = Math.round((unitScore * 0.75 + labScore * 0.25) * 100)
  return Math.min(100, Math.max(0, pct))
}

function versioningFullyMastered(progress: PathProgress): boolean {
  const lab = labs.find((l) => l.kind === 'versioning')
  if (!lab || lab.kind !== 'versioning' || lab.items.length === 0) return false
  return lab.items.every((i) => progress.versioningCorrect.includes(i.id))
}

function filtersFullyMastered(progress: PathProgress): boolean {
  const lab = labs.find((l) => l.kind === 'filters')
  if (!lab || lab.kind !== 'filters' || lab.items.length === 0) return false
  return lab.items.every((i) => progress.filterCorrect.includes(i.id))
}

function anyCapstoneComplete(progress: PathProgress): boolean {
  return labs.some((lab) => {
    if (lab.kind !== 'capstone') return false
    const checks = progress.labChecks[lab.id] ?? []
    return lab.checklist.length > 0 && lab.checklist.every((c) => checks.includes(c))
  })
}

function track0Complete(progress: PathProgress): boolean {
  const track = tracks.find((t) => t.id === 'track-0')
  if (!track) return false
  return track.moduleIds.every((id) => progress.clearedUnits.includes(id))
}

function weakQueueCleared(progress: PathProgress): boolean {
  const ratings = Object.values(progress.drillRatings)
  if (ratings.length === 0) return false
  return ratings.every((r) => r === 'knew') && ratings.length >= 3
}

/**
 * Return newly earned badge ids (not already in progress.earnedBadges).
 */
export function evaluateNewBadges(
  progress: PathProgress,
  path: LearningPathId,
): string[] {
  const earned = new Set(progress.earnedBadges)
  const fresh: string[] = []

  const candidates = badges.filter((b) => b.path === 'both' || b.path === path)

  for (const b of candidates) {
    if (earned.has(b.id)) continue
    let ok = false
    switch (b.id) {
      case 'first-steps':
        ok = progress.xp > 0
        break
      case 'streak-3':
        ok = progress.streakDays >= 3
        break
      case 'streak-7':
        ok = progress.streakDays >= 7
        break
      case 'streak-14':
        ok = progress.streakDays >= 14
        break
      case 'versioning-whisperer':
        ok = versioningFullyMastered(progress)
        break
      case 'filter-fluent':
        ok = filtersFullyMastered(progress)
        break
      case 'phase-2-cleared':
        ok = path === 'fluency' && progress.clearedUnits.includes('phase-2')
        break
      case 'track-0-complete':
        ok = path === 'implementation' && track0Complete(progress)
        break
      case 'capstone-finisher':
        ok = anyCapstoneComplete(progress)
        break
      case 'weak-queue-cleared':
        ok = weakQueueCleared(progress)
        break
      case 'quiz-streak-5':
        ok = progress.sectionChecks.length >= 5
        break
      case 'architect-rank':
        ok = rankFromXp(progress.xp, path).id === 'architect'
        break
      default:
        ok = false
    }
    if (ok) fresh.push(b.id)
  }
  return fresh
}

export type GameEvent =
  | { type: 'quiz'; quizId: string }
  | { type: 'drill'; rating: 'knew' | 'needs-work'; drillId: string; prev?: 'knew' | 'needs-work' }
  | { type: 'versioning'; itemId: string }
  | { type: 'filter'; itemId: string }
  | { type: 'labComplete'; labId: string }
  | { type: 'decision'; scenarioId: string }
  | { type: 'unitCleared'; unitId: string }

export type ApplyResult = {
  progress: PathProgress
  xpGained: number
  newBadges: string[]
  streakBonus: boolean
}

/**
 * Idempotent award pipeline: touch streak, grant XP once per event key, eval badges.
 */
export function applyGameEvent(
  progress: PathProgress,
  path: LearningPathId,
  event: GameEvent,
): ApplyResult {
  let p = { ...progress }
  const touched = touchDailyActivity(p)
  p = touched.progress
  let xpGained = touched.streakBonus ? XP.streakDayBonus : 0

  const awardOnce = (key: string, amount: number) => {
    if (p.xpAwardKeys.includes(key)) return
    p = {
      ...p,
      xpAwardKeys: [...p.xpAwardKeys, key],
      xp: p.xp + amount,
    }
    xpGained += amount
  }

  switch (event.type) {
    case 'quiz':
      if (!p.sectionChecks.includes(event.quizId)) {
        p = { ...p, sectionChecks: [...p.sectionChecks, event.quizId] }
        awardOnce(`quiz:${event.quizId}`, XP.quizCorrect)
      }
      break
    case 'drill': {
      const prev = event.prev
      p = {
        ...p,
        drillRatings: { ...p.drillRatings, [event.drillId]: event.rating },
        drillRatedAt: {
          ...p.drillRatedAt,
          [event.drillId]: utcDateString(),
        },
      }
      // Award on first rating or upgrade to knew
      if (event.rating === 'knew') {
        awardOnce(`drill-knew:${event.drillId}`, XP.drillKnew)
      } else if (!prev) {
        awardOnce(`drill-attempt:${event.drillId}`, XP.drillNeedsWork)
      }
      break
    }
    case 'versioning':
      if (!p.versioningCorrect.includes(event.itemId)) {
        p = { ...p, versioningCorrect: [...p.versioningCorrect, event.itemId] }
        awardOnce(`ver:${event.itemId}`, XP.versioningItem)
      }
      break
    case 'filter':
      if (!p.filterCorrect.includes(event.itemId)) {
        p = { ...p, filterCorrect: [...p.filterCorrect, event.itemId] }
        awardOnce(`filter:${event.itemId}`, XP.filterItem)
      }
      break
    case 'labComplete':
      awardOnce(`lab:${event.labId}`, XP.labChecklistComplete)
      break
    case 'decision':
      if (!p.decisionCorrect.includes(event.scenarioId)) {
        p = { ...p, decisionCorrect: [...p.decisionCorrect, event.scenarioId] }
        awardOnce(`dec:${event.scenarioId}`, XP.decisionCorrect)
      }
      break
    case 'unitCleared':
      if (!p.clearedUnits.includes(event.unitId)) {
        p = { ...p, clearedUnits: [...p.clearedUnits, event.unitId] }
        awardOnce(`unit:${event.unitId}`, XP.unitCleared)
        if (!p.completedItems.includes(event.unitId)) {
          p = { ...p, completedItems: [...p.completedItems, event.unitId] }
        }
      }
      break
  }

  const newBadges = evaluateNewBadges(p, path)
  if (newBadges.length > 0) {
    p = { ...p, earnedBadges: [...p.earnedBadges, ...newBadges] }
  }

  return { progress: p, xpGained, newBadges, streakBonus: touched.streakBonus }
}
