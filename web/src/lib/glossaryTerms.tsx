import type { ReactNode } from 'react'
import { glossary, glossarySlug } from '../content/glossary'
import { GlossaryTerm } from '../components/GlossaryTerm'

type AliasHit = {
  alias: string
  term: string
  meaning: string
  slug: string
}

/** True if `index` in `text` is a safe alias boundary (not mid-identifier). */
function isBoundary(text: string, index: number, aliasLen: number): boolean {
  const before = index === 0 ? '' : text[index - 1]
  const after = index + aliasLen >= text.length ? '' : text[index + aliasLen]
  const wordy = /[A-Za-z0-9_]/
  if (before && wordy.test(before) && before !== '/') return false
  if (after && wordy.test(after)) return false
  return true
}

function buildAliasIndex(): AliasHit[] {
  const hits: AliasHit[] = []
  for (const entry of glossary) {
    const aliases = entry.aliases?.length ? entry.aliases : [entry.term]
    const slug = glossarySlug(entry.term)
    for (const alias of aliases) {
      if (!alias) continue
      hits.push({ alias, term: entry.term, meaning: entry.meaning, slug })
    }
  }
  hits.sort((a, b) => b.alias.length - a.alias.length)
  return hits
}

const ALIAS_INDEX = buildAliasIndex()

const URL_RE = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/g

export type AnnotateOptions = {
  keyPrefix?: string
  /** false = <abbr title> only (safe inside quiz choice buttons) */
  interactive?: boolean
}

/**
 * Annotate glossary terms in plain text. Skips URL substrings.
 * Returns React nodes suitable for paragraph/list/table/quiz copy.
 */
export function annotateGlossary(
  text: string,
  options: AnnotateOptions | string = {},
): ReactNode[] {
  const opts: AnnotateOptions =
    typeof options === 'string' ? { keyPrefix: options } : options
  const keyPrefix = opts.keyPrefix ?? 'g'
  const interactive = opts.interactive !== false

  if (!text) return [text]

  const nodes: ReactNode[] = []
  let cursor = 0
  let autoKey = 0

  const pushAnnotated = (segment: string) => {
    if (!segment) return
    let i = 0
    while (i < segment.length) {
      let best: { start: number; hit: AliasHit } | null = null
      for (const hit of ALIAS_INDEX) {
        const start = segment.indexOf(hit.alias, i)
        if (start === -1) continue
        if (!isBoundary(segment, start, hit.alias.length)) continue
        if (
          !best ||
          start < best.start ||
          (start === best.start && hit.alias.length > best.hit.alias.length)
        ) {
          best = { start, hit }
        }
      }
      if (!best) {
        nodes.push(segment.slice(i))
        break
      }
      if (best.start > i) {
        nodes.push(segment.slice(i, best.start))
      }
      const { hit } = best
      const matched = segment.slice(best.start, best.start + hit.alias.length)
      nodes.push(
        <GlossaryTerm
          key={`${keyPrefix}-${autoKey++}-${hit.slug}`}
          term={hit.term}
          meaning={hit.meaning}
          slug={hit.slug}
          interactive={interactive}
        >
          {matched}
        </GlossaryTerm>,
      )
      i = best.start + hit.alias.length
    }
  }

  URL_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > cursor) {
      pushAnnotated(text.slice(cursor, match.index))
    }
    const href = match[0]
    nodes.push(
      <a
        key={`${keyPrefix}-url-${autoKey++}`}
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {href}
      </a>,
    )
    cursor = match.index + href.length
  }
  if (cursor < text.length) {
    pushAnnotated(text.slice(cursor))
  }

  return nodes.length > 0 ? nodes : [text]
}
