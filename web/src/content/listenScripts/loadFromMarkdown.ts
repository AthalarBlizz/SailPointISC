/**
 * Load Listen scripts from docs/listen-scripts/*.md (repo source of truth).
 * Blank-line-separated paragraphs become spoken utterances.
 */

const rawModules = import.meta.glob('../../../../docs/listen-scripts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Strip title / metadata / HR; split body into non-empty paragraphs. */
export function parseListenMarkdown(raw: string): string[] {
  let body = raw.replace(/\r\n/g, '\n')

  // Drop YAML frontmatter if present
  if (body.startsWith('---\n')) {
    const end = body.indexOf('\n---\n', 4)
    if (end !== -1) body = body.slice(end + 5)
  }

  const lines = body.split('\n')
  const contentLines: string[] = []
  let pastMeta = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!pastMeta) {
      if (
        trimmed === '' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('>') ||
        trimmed === '---'
      ) {
        continue
      }
      pastMeta = true
    }
    contentLines.push(line)
  }

  return contentLines
    .join('\n')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p.length > 0 && !p.startsWith('#'))
}

function unitIdFromPath(path: string): string | null {
  const base = path.split('/').pop() ?? ''
  const m = base.match(/^(phase-\d+|m\d+)\.md$/)
  return m ? m[1] : null
}

const byId: Record<string, string[]> = {}
for (const [path, raw] of Object.entries(rawModules)) {
  const id = unitIdFromPath(path)
  if (!id) continue
  byId[id] = parseListenMarkdown(raw)
}

/** Paragraphs for a phase or module id, or undefined if no markdown file. */
export function getListenScript(unitId: string): string[] | undefined {
  const paras = byId[unitId]
  return paras && paras.length > 0 ? paras : undefined
}

export const phaseListenScripts: Record<string, string[]> = Object.fromEntries(
  Object.entries(byId).filter(([id]) => id.startsWith('phase-')),
)

export const moduleListenScripts: Record<string, string[]> = Object.fromEntries(
  Object.entries(byId).filter(([id]) => /^m\d+$/.test(id)),
)
