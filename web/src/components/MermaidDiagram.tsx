import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'

let mermaidReady = false

function ensureMermaid() {
  if (mermaidReady) return
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'neutral',
    fontFamily: 'inherit',
  })
  mermaidReady = true
}

export function MermaidDiagram({
  mermaid: source,
  title,
  caption,
}: {
  mermaid: string
  title?: string
  caption?: string
}) {
  const reactId = useId().replace(/:/g, '')
  const hostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ensureMermaid()
    const renderId = `mmd-${reactId}`
    ;(async () => {
      try {
        const { svg } = await mermaid.render(renderId, source.trim())
        if (cancelled || !hostRef.current) return
        hostRef.current.innerHTML = svg
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Diagram failed to render')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [source, reactId])

  return (
    <figure className="diagram-block">
      {title ? <figcaption className="diagram-title">{title}</figcaption> : null}
      {error ? (
        <pre className="diagram-fallback">{source}</pre>
      ) : (
        <div ref={hostRef} className="diagram-svg" />
      )}
      {caption ? <p className="diagram-caption muted">{caption}</p> : null}
      {error ? <p className="muted">Could not render diagram.</p> : null}
    </figure>
  )
}
