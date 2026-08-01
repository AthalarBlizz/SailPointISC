import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { allDrills, phases } from '../content'
import { useProgress } from '../hooks/useProgress'

export function DrillsPage() {
  const [params, setParams] = useSearchParams()
  const phaseFilter = params.get('phase') ?? 'all'
  const { progress, setDrillRating } = useProgress()
  const drills = useMemo(() => {
    const all = allDrills()
    if (phaseFilter === 'weak') {
      return all.filter((d) => progress.drillRatings[d.id] === 'needs-work')
    }
    if (phaseFilter !== 'all') {
      return all.filter((d) => d.phaseId === phaseFilter)
    }
    return all
  }, [phaseFilter, progress.drillRatings])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const current = drills[index] ?? null

  const go = (next: number) => {
    setRevealed(false)
    setIndex(((next % drills.length) + drills.length) % drills.length)
  }

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">Self-rated flashcards</span>
        <h1>Conversational drills</h1>
        <p className="muted">
          Reveal the model answer, then rate yourself. “Needs work” builds your weak queue.
        </p>
        <div className="actions" style={{ marginTop: '0.75rem' }}>
          <select
            className="lab-input"
            style={{ width: 'auto', minWidth: '12rem' }}
            value={phaseFilter}
            onChange={(e) => {
              setParams(e.target.value === 'all' ? {} : { phase: e.target.value })
              setIndex(0)
              setRevealed(false)
            }}
            aria-label="Filter drills"
          >
            <option value="all">All phases</option>
            <option value="weak">Needs work only</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                Phase {p.number}: {p.shortTitle}
              </option>
            ))}
          </select>
        </div>
      </header>

      {!current ? (
        <div className="card">
          <p>
            {phaseFilter === 'weak'
              ? 'No weak items yet — practice a few drills and mark some as Needs work.'
              : 'No drills in this filter.'}
          </p>
          <Link className="btn btn-primary" to="/drills">
            Show all
          </Link>
        </div>
      ) : (
        <div className="card drill-card">
          <div className="meta-row">
            <span className="chip">{current.phaseTitle}</span>
            <span className="chip">
              {index + 1} / {drills.length}
            </span>
            {progress.drillRatings[current.id] ? (
              <span className={`chip ${progress.drillRatings[current.id] === 'knew' ? 'done' : ''}`}>
                {progress.drillRatings[current.id] === 'knew' ? 'Knew it' : 'Needs work'}
              </span>
            ) : null}
          </div>
          <p className="drill-prompt">{current.prompt}</p>
          {revealed ? (
            <div className="drill-answer">
              <strong>Model answer</strong>
              <p style={{ margin: '0.4rem 0 0' }}>{current.answer}</p>
            </div>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>
              Reveal answer
            </button>
          )}
          {revealed ? (
            <div className="actions">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  setDrillRating(current.id, 'knew')
                  go(index + 1)
                }}
              >
                Knew it
              </button>
              <button
                type="button"
                className="btn btn-warn"
                onClick={() => {
                  setDrillRating(current.id, 'needs-work')
                  go(index + 1)
                }}
              >
                Needs work
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => go(index + 1)}>
                Skip
              </button>
            </div>
          ) : (
            <div className="actions">
              <button type="button" className="btn btn-ghost" onClick={() => go(index - 1)}>
                Previous
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => go(index + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
