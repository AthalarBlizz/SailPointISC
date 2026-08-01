import type { BadgeDef } from './types'

/** Declarative badge catalog — evaluated against PathProgress after each award. */
export const badges: BadgeDef[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Earn your first XP on this path.',
    path: 'both',
  },
  {
    id: 'streak-3',
    title: 'Warming Up',
    description: 'Maintain a 3-day activity streak.',
    path: 'both',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day activity streak.',
    path: 'both',
  },
  {
    id: 'streak-14',
    title: 'Fortnight Focus',
    description: 'Maintain a 14-day activity streak.',
    path: 'both',
  },
  {
    id: 'versioning-whisperer',
    title: 'Versioning Whisperer',
    description: 'Master all items in the versioning mapper lab.',
    path: 'both',
  },
  {
    id: 'filter-fluent',
    title: 'Filter Fluent',
    description: 'Get every filter drill correct.',
    path: 'both',
  },
  {
    id: 'phase-2-cleared',
    title: 'Dual-World Cleared',
    description: 'Clear Phase 2 (versioning dual-world).',
    path: 'fluency',
  },
  {
    id: 'track-0-complete',
    title: 'Foundations Solid',
    description: 'Clear all Track 0 modules (M0–M3).',
    path: 'implementation',
  },
  {
    id: 'capstone-finisher',
    title: 'Capstone Finisher',
    description: 'Complete every checklist item on a capstone lab.',
    path: 'both',
  },
  {
    id: 'weak-queue-cleared',
    title: 'Weak Queue Cleared',
    description: 'Re-rate every needs-work drill to Knew it (no weak items left).',
    path: 'both',
  },
  {
    id: 'quiz-streak-5',
    title: 'Quiz Sharpshooter',
    description: 'Pass 5 section micro-checks.',
    path: 'both',
  },
  {
    id: 'architect-rank',
    title: 'Architect',
    description: 'Reach the Architect rank on this path.',
    path: 'both',
  },
]
