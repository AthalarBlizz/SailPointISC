import type { ContentBlock, Module, Phase, Section } from '../content/types'
import { getListenScript } from '../content/listenScripts'

export type UtteranceKind = 'intro' | 'body' | 'bridge' | 'aside' | 'outro' | 'quiz-pause'

export type NarrationUtterance = {
  id: string
  text: string
  sectionId?: string
  kind: UtteranceKind
  /** Player should pause until learner hits Next (e.g. micro-check). */
  waitForNext?: boolean
}

export type ListenUnit = {
  id: string
  title: string
  shortTitle: string
  goal: string
  outcomes: string[]
  sections: Section[]
  checkpoints: { id: string }[]
  listenScript?: string[]
  /** Path B only */
  whenToUse?: string[]
  whenNot?: string[]
  failureModes?: string[]
}

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const

/** Expand paths and symbols so TTS doesn't mangle them. */
export function speechHygiene(raw: string): string {
  let s = raw
  // URLs → drop
  s = s.replace(/https?:\/\/[^\s)]+/gi, 'the linked docs')
  // API paths like /identities/v1
  s = s.replace(/\/(?:[a-zA-Z0-9._-]+\/)+[a-zA-Z0-9._-]+/g, (path) => {
    const segs = path.split('/').filter(Boolean)
    return (
      'slash ' +
      segs
        .map((seg) => {
          if (/^v\d+$/i.test(seg)) return seg.replace(/^v/i, 'v ')
          return seg.replace(/-/g, ' ')
        })
        .join(' slash ')
    )
  })
  // Bare /v2026 or /latest
  s = s.replace(/(?:^|[\s(])(\/(?:v\d{4}|latest))\b/gi, (_m, p1: string) =>
    _m.replace(p1, ` slash ${p1.slice(1)}`),
  )
  // Operators & arrows
  s = s.replace(/→/g, ' leads to ')
  s = s.replace(/\beq\b/gi, 'equals')
  s = s.replace(/\bne\b/gi, 'not equals')
  s = s.replace(/\bco\b/gi, 'contains')
  s = s.replace(/\bsw\b/gi, 'starts with')
  // GUID-ish
  s = s.replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    'a tenant specific I D',
  )
  // Markdown-ish
  s = s.replace(/[*_`#]+/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  // Version spoken slightly clearer
  s = s.replace(/\bv(\d+)\b/gi, 'v $1')
  return s
}

function push(
  out: NarrationUtterance[],
  partial: Omit<NarrationUtterance, 'id'> & { id?: string },
) {
  const text = speechHygiene(partial.text)
  if (!text) return
  out.push({
    id: partial.id ?? `u-${out.length}`,
    text,
    sectionId: partial.sectionId,
    kind: partial.kind,
    waitForNext: partial.waitForNext,
  })
}

function summarizeTable(block: Extract<ContentBlock, { type: 'table' }>): string {
  const n = block.rows.length
  const cols = block.headers.join(', ')
  if (n === 0) {
    return 'There’s a reference table on screen — skim it when you look back.'
  }
  // Teaching summary: name columns + count, pull first 2 row labels if useful
  const labels = block.rows
    .slice(0, 2)
    .map((r) => r[0])
    .filter(Boolean)
  const sample =
    labels.length > 0
      ? ` It covers things like ${labels.join(' and ')}${n > 2 ? ', and more' : ''}.`
      : ''
  return `There’s a table on screen with columns for ${cols}.${sample} Don’t try to memorize it from audio — glance at it when you’re back.`
}

function listToSpeech(items: string[], ordered?: boolean): string {
  const capped = items.slice(0, 6)
  const rest = items.length - capped.length
  const body = capped
    .map((item, i) => {
      const clean = speechHygiene(item)
      if (ordered) return `${ORDINAL[i] ?? `number ${i + 1}`}: ${clean}`
      return ORDINAL[i] ? `${ORDINAL[i]}, ${clean}` : clean
    })
    .join('. ')
  const opener =
    capped.length === 1
      ? 'One point: '
      : capped.length <= 6
        ? `${capped.length === 2 ? 'Two' : capped.length === 3 ? 'Three' : `${capped.length}`} things: `
        : ''
  const more = rest > 0 ? ` Plus ${rest} more on the page.` : ''
  return `${opener}${body}.${more}`
}

function blockToSpeech(block: ContentBlock): { text: string; waitForNext?: boolean; kind?: UtteranceKind } | null {
  switch (block.type) {
    case 'paragraph':
      return { text: block.text, kind: 'body' }
    case 'callout': {
      const prefix =
        block.tone === 'warn'
          ? 'Watch out for this. '
          : block.tone === 'tip'
            ? 'Here’s the tip. '
            : 'Note. '
      const title = block.title ? `${block.title}. ` : ''
      return { text: `${prefix}${title}${block.text}`, kind: 'aside' }
    }
    case 'list':
      return { text: listToSpeech(block.items, block.ordered), kind: 'body' }
    case 'table':
      return { text: summarizeTable(block), kind: 'aside' }
    case 'code':
      return {
        text: `There’s a ${block.language ?? 'code'} sample on screen — read it when you look back; I won’t recite the code.`,
        kind: 'aside',
      }
    case 'diagram': {
      const pic = block.caption || block.title
      return {
        text: pic
          ? `Picture this: ${pic}`
          : 'There’s a diagram on screen that maps the idea visually — check it when you glance back.',
        kind: 'aside',
      }
    }
    case 'links':
      return {
        text: 'Links to the official docs are on the page when you need them.',
        kind: 'aside',
      }
    case 'quiz':
      return {
        text: 'Pause for the micro-check on screen. Answer it, then hit Next when you’re ready to continue.',
        kind: 'quiz-pause',
        waitForNext: true,
      }
    default:
      return null
  }
}

function rewriteSection(section: Section, index: number): NarrationUtterance[] {
  const out: NarrationUtterance[] = []
  const bridge =
    index === 0
      ? `Let’s start with ${section.title}.`
      : `Next up: ${section.title}.`

  push(out, {
    id: `${section.id}-bridge`,
    text: bridge,
    sectionId: section.id,
    kind: 'bridge',
  })

  if (section.listenScript && section.listenScript.length > 0) {
    section.listenScript.forEach((para, i) => {
      push(out, {
        id: `${section.id}-s-${i}`,
        text: para,
        sectionId: section.id,
        kind: 'body',
      })
    })
    return out
  }

  for (let i = 0; i < section.blocks.length; i++) {
    const spoken = blockToSpeech(section.blocks[i])
    if (!spoken) continue
    push(out, {
      id: `${section.id}-b-${i}`,
      text: spoken.text,
      sectionId: section.id,
      kind: spoken.kind ?? 'body',
      waitForNext: spoken.waitForNext,
    })
  }
  return out
}

function outcomesSpeech(outcomes: string[]): string {
  const top = outcomes.slice(0, 3)
  const parts = top.map((o, i) => `${ORDINAL[i]}, ${speechHygiene(o)}`)
  return `By the end of this, you should be able to: ${parts.join('; ')}.`
}

/**
 * Build a human-friendly listen script for a phase or module.
 * Unit-level listenScript replaces the whole auto lesson (with intro/outro wrappers).
 */
export function buildListenScript(unit: ListenUnit): NarrationUtterance[] {
  const out: NarrationUtterance[] = []

  push(out, {
    id: `${unit.id}-intro`,
    text: `This is ${unit.shortTitle}. ${unit.goal}.`,
    kind: 'intro',
  })

  if (unit.listenScript && unit.listenScript.length > 0) {
    unit.listenScript.forEach((para, i) => {
      // Spread authored paras across sections for highlight when possible
      const sectionId = unit.sections[Math.min(i, unit.sections.length - 1)]?.id
      push(out, {
        id: `${unit.id}-authored-${i}`,
        text: para,
        sectionId,
        kind: i === 0 ? 'intro' : 'body',
      })
    })
    push(out, {
      id: `${unit.id}-outro`,
      text: outroSpeech(unit),
      kind: 'outro',
    })
    return out
  }

  if (unit.outcomes.length > 0) {
    push(out, {
      id: `${unit.id}-outcomes`,
      text: outcomesSpeech(unit.outcomes),
      kind: 'intro',
    })
  }

  unit.sections.forEach((section, i) => {
    out.push(...rewriteSection(section, i))
  })

  if (unit.whenToUse && unit.whenToUse.length > 0) {
    push(out, {
      id: `${unit.id}-when`,
      text: `When to use this: ${listToSpeech(unit.whenToUse.slice(0, 4))}`,
      kind: 'aside',
    })
  }
  if (unit.failureModes && unit.failureModes.length > 0) {
    push(out, {
      id: `${unit.id}-fail`,
      text: `Common failure modes: ${listToSpeech(unit.failureModes.slice(0, 4))}`,
      kind: 'aside',
    })
  }

  push(out, {
    id: `${unit.id}-outro`,
    text: outroSpeech(unit),
    kind: 'outro',
  })

  return out
}

function outroSpeech(unit: ListenUnit): string {
  const hasQuiz = unit.sections.some((s) => s.blocks.some((b) => b.type === 'quiz'))
  const drillBit =
    unit.checkpoints.length > 0
      ? ' Rate the conversational checkpoints in Drill mode so we know what to revisit.'
      : ''
  const quizBit = hasQuiz
    ? ' Finish any micro-checks you skipped while listening.'
    : ''
  return `That’s the listen-through for ${unit.shortTitle}. When you’re back at the screen:${quizBit}${drillBit} Clear the unit when the checks and drills are done.`
}

export function phaseToListenUnit(phase: Phase): ListenUnit {
  // Prefer inline override; otherwise docs/listen-scripts/path-a/{id}.md
  const fromDocs = getListenScript(phase.id)
  return {
    id: phase.id,
    title: phase.title,
    shortTitle: phase.shortTitle,
    goal: phase.goal,
    outcomes: phase.outcomes,
    sections: phase.sections,
    checkpoints: phase.checkpoints,
    listenScript: phase.listenScript?.length ? phase.listenScript : fromDocs,
  }
}

export function moduleToListenUnit(mod: Module): ListenUnit {
  const fromDocs = getListenScript(mod.id)
  return {
    id: mod.id,
    title: mod.title,
    shortTitle: mod.shortTitle,
    goal: mod.goal,
    outcomes: mod.outcomes,
    sections: mod.sections,
    checkpoints: mod.checkpoints,
    listenScript: mod.listenScript?.length ? mod.listenScript : fromDocs,
    whenToUse: mod.whenToUse,
    whenNot: mod.whenNot,
    failureModes: mod.failureModes,
  }
}
