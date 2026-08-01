export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'code'; language?: string; code: string }
  | { type: 'callout'; tone?: 'info' | 'warn' | 'tip'; title?: string; text: string }
  | { type: 'links'; items: { label: string; href: string }[] }

export type Section = {
  id: string
  title: string
  blocks: ContentBlock[]
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
}

export type LabKind = 'versioning' | 'filters' | 'capstone'

export type CapstoneLab = {
  id: string
  kind: 'capstone'
  title: string
  letter: string
  brief: string
  checklist: string[]
}

export type VersioningLab = {
  id: string
  kind: 'versioning'
  title: string
  description: string
  items: { id: string; legacy: string; modern: string; hint: string }[]
}

export type FilterLab = {
  id: string
  kind: 'filters'
  title: string
  description: string
  items: { id: string; prompt: string; answer: string; note?: string }[]
}

export type Lab = CapstoneLab | VersioningLab | FilterLab
