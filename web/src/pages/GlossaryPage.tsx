import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { glossary, glossarySlug } from '../content'

export function GlossaryPage() {
  const [params] = useSearchParams()
  const focus = params.get('term')

  useEffect(() => {
    if (!focus) return
    const el = document.getElementById(`glossary-${focus}`)
    if (!el) return
    el.classList.add('is-target')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return () => el.classList.remove('is-target')
  }, [focus])

  const sorted = [...glossary].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }),
  )

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">Quick reference</span>
        <h1>Conversational glossary</h1>
        <p className="muted">
          Phrases you’ll hear in ISC developer conversations. In lessons, dotted underlines
          open a short tooltip — tap or hover a term, then open the full entry here.
        </p>
      </header>
      <div className="stack">
        {sorted.map((g) => {
          const slug = glossarySlug(g.term)
          return (
            <article
              key={g.term}
              id={`glossary-${slug}`}
              className={`card glossary-card${focus === slug ? ' is-target' : ''}`}
            >
              <h3 style={{ margin: 0 }}>{g.term}</h3>
              <p style={{ marginTop: '0.35rem' }}>{g.meaning}</p>
              {g.aliases && g.aliases.length > 1 ? (
                <p className="muted" style={{ marginTop: '0.35rem', fontSize: '0.8rem' }}>
                  Also matched as: {g.aliases.filter((a) => a !== g.term).join(', ')}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}
