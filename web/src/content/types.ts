export type LearningPathId = 'fluency' | 'implementation'

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'code'; language?: string; code: string }
  | { type: 'callout'; tone?: 'info' | 'warn' | 'tip'; title?: string; text: string }
  | { type: 'links'; items: { label: string; href: string }[] }
  | { type: 'diagram'; title?: string; mermaid: string; caption?: string }
  | {
      type: 'quiz'
      id: string
      prompt: string
      choices: { id: string; label: string }[]
      correctId: string
      explanation: string
    }

export type Section = {
  id: string
  title: string
  blocks: ContentBlock[]
  /** Hand-written spoken paragraphs for Listen mode (overrides auto-rewrite for this section). */
  listenScript?: string[]
}

export type Drill = {
  id: string
  prompt: string
  answer: string
}

export type Phase = {
  id: string
  number: number
  title: string
  shortTitle: string
  estTime: string
  goal: string
  outcomes: string[]
  sections: Section[]
  checkpoints: Drill[]
  labs?: string[]
  /** Path B modules to deepen this phase */
  deepenModules?: string[]
  /** Hand-written full-lesson spoken paragraphs for Listen mode. */
  listenScript?: string[]
}

export type Module = {
  id: string
  number: number
  title: string
  shortTitle: string
  estTime: string
  goal: string
  trackId: string
  outcomes: string[]
  whenToUse: string[]
  whenNot: string[]
  sections: Section[]
  failureModes: string[]
  enterpriseChecklist: string[]
  checkpoints: Drill[]
  labs?: string[]
  /** Path A phase for fluency refresh */
  fluencyPhaseId?: string
  /** Hand-written full-lesson spoken paragraphs for Listen mode. */
  listenScript?: string[]
}

export type Track = {
  id: string
  number: number
  title: string
  shortTitle: string
  description: string
  moduleIds: string[]
}

export type SnapshotRow = {
  topic: string
  current: string
  sayThis: string
}

export type GlossaryEntry = {
  term: string
  meaning: string
}

export type TrackerItem = {
  id: string
  label: string
  path: LearningPathId
}

export type LabPathTag = 'fluency' | 'implementation' | 'both'

export type CapstoneLab = {
  id: string
  kind: 'capstone'
  title: string
  letter: string
  brief: string
  checklist: string[]
  path: LabPathTag
}

export type VersioningLab = {
  id: string
  kind: 'versioning'
  title: string
  description: string
  items: { id: string; legacy: string; modern: string; hint: string }[]
  path: LabPathTag
}

export type FilterLab = {
  id: string
  kind: 'filters'
  title: string
  description: string
  items: { id: string; prompt: string; answer: string; note?: string }[]
  path: LabPathTag
}

export type ImplementationLab = {
  id: string
  kind: 'implementation'
  title: string
  description: string
  steps: string[]
  acceptance: string[]
  path: LabPathTag
}

export type DecisionScenario = {
  id: string
  prompt: string
  /** Preferred extension point / answer label */
  answer: string
  rationale: string
  /** Multiple-choice options; correct choice matches `answer` */
  choices: string[]
}

export type DecisionLab = {
  id: string
  kind: 'decision'
  title: string
  description: string
  scenarios: DecisionScenario[]
  path: LabPathTag
}

export type Lab = CapstoneLab | VersioningLab | FilterLab | ImplementationLab | DecisionLab

export type BadgeDef = {
  id: string
  title: string
  description: string
  path: LearningPathId | 'both'
}
