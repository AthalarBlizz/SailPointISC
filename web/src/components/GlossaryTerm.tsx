import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type GlossaryTermProps = {
  term: string
  meaning: string
  slug: string
  children: ReactNode
  /** When false, render a static abbr (safe inside buttons). Default true. */
  interactive?: boolean
}

/**
 * In-content glossary chip: hover/focus tooltip on desktop; tap toggles when interactive;
 * link opens the full entry on the glossary page.
 */
export function GlossaryTerm({
  term,
  meaning,
  slug,
  children,
  interactive = true,
}: GlossaryTermProps) {
  const tipId = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open || !interactive) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, interactive])

  if (!interactive) {
    return (
      <abbr className="glossary-term glossary-term-passive" title={`${term}: ${meaning}`}>
        {children}
      </abbr>
    )
  }

  return (
    <span
      ref={rootRef}
      className={`glossary-term${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="glossary-term-trigger"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {children}
      </button>
      <span className="glossary-term-tip" role="tooltip" id={tipId}>
        <span className="glossary-term-tip-term">{term}</span>
        <span className="glossary-term-tip-meaning">{meaning}</span>
        <Link
          className="glossary-term-tip-link"
          to={`/glossary?term=${encodeURIComponent(slug)}`}
          onClick={() => setOpen(false)}
        >
          Open glossary
        </Link>
      </span>
    </span>
  )
}
