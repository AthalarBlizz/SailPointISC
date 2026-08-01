import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLab } from '../content'
import { useProgress } from '../hooks/useProgress'

function normalizeFilter(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function LabPage() {
  const { labId } = useParams()
  const lab = getLab(labId ?? '')
  const {
    progress,
    toggleLabCheck,
    setLabNotes,
    markVersioningCorrect,
    markFilterCorrect,
    markDecisionCorrect,
  } = useProgress()

  const [vIndex, setVIndex] = useState(0)
  const [showModern, setShowModern] = useState(false)
  const [guess, setGuess] = useState('')
  const [filterFeedback, setFilterFeedback] = useState<string | null>(null)
  const [decisionPicks, setDecisionPicks] = useState<Record<string, string>>({})
  const [decisionChecked, setDecisionChecked] = useState<Record<string, boolean>>({})

  const versioningItem = useMemo(() => {
    if (!lab || lab.kind !== 'versioning') return null
    return lab.items[vIndex] ?? null
  }, [lab, vIndex])

  const filterItem = useMemo(() => {
    if (!lab || lab.kind !== 'filters') return null
    return lab.items[vIndex] ?? null
  }, [lab, vIndex])

  if (!lab) {
    return (
      <div>
        <h1>Lab not found</h1>
        <Link to="/labs">Back to labs</Link>
      </div>
    )
  }

  if (lab.kind === 'versioning' && versioningItem) {
    const mastered = progress.versioningCorrect.includes(versioningItem.id)
    return (
      <div>
        <header className="page-header">
          <Link to="/labs" className="muted">
            ← Labs
          </Link>
          <h1>{lab.title}</h1>
          <p className="muted">{lab.description}</p>
        </header>
        <div className="card stack">
          <div className="meta-row">
            <span className="chip">
              {vIndex + 1} / {lab.items.length}
            </span>
            {mastered ? <span className="chip done">Mastered</span> : null}
          </div>
          <div>
            <div className="eyebrow">Legacy path</div>
            <code style={{ fontSize: '1.05rem' }}>{versioningItem.legacy}</code>
          </div>
          {showModern ? (
            <div className="drill-answer">
              <div className="eyebrow">Current path</div>
              <code style={{ fontSize: '1.05rem' }}>{versioningItem.modern}</code>
              <p className="muted" style={{ marginTop: '0.5rem' }}>
                Hint: {versioningItem.hint}
              </p>
            </div>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setShowModern(true)}>
              Reveal modern path
            </button>
          )}
          <div className="actions">
            {showModern ? (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  markVersioningCorrect(versioningItem.id)
                  setShowModern(false)
                  setVIndex((i) => (i + 1) % lab.items.length)
                }}
              >
                Got it — next
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setShowModern(false)
                setVIndex((i) => (i + 1) % lab.items.length)
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (lab.kind === 'filters' && filterItem) {
    const correct = progress.filterCorrect.includes(filterItem.id)
    return (
      <div>
        <header className="page-header">
          <Link to="/labs" className="muted">
            ← Labs
          </Link>
          <h1>{lab.title}</h1>
          <p className="muted">{lab.description}</p>
        </header>
        <div className="card stack">
          <div className="meta-row">
            <span className="chip">
              {vIndex + 1} / {lab.items.length}
            </span>
            {correct ? <span className="chip done">Correct</span> : null}
          </div>
          <p className="drill-prompt">{filterItem.prompt}</p>
          <label className="muted" htmlFor="filter-guess">
            Your filter string
          </label>
          <input
            id="filter-guess"
            className={`lab-input${correct ? ' ok' : ''}`}
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value)
              setFilterFeedback(null)
            }}
            placeholder='e.g. alias eq "Jennifer.Thomas"'
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {filterFeedback ? <p className="muted">{filterFeedback}</p> : null}
          {filterItem.note && filterFeedback ? (
            <p className="muted">{filterItem.note}</p>
          ) : null}
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const ok = normalizeFilter(guess) === normalizeFilter(filterItem.answer)
                if (ok) {
                  markFilterCorrect(filterItem.id)
                  setFilterFeedback('Correct.')
                } else {
                  setFilterFeedback(`Model: ${filterItem.answer}`)
                }
              }}
            >
              Check
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setGuess('')
                setFilterFeedback(null)
                setVIndex((i) => (i + 1) % lab.items.length)
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (lab.kind === 'capstone') {
    const checks = progress.labChecks[lab.id] ?? []
    const notes = progress.labNotes[lab.id] ?? ''
    return (
      <div>
        <header className="page-header">
          <Link to="/labs" className="muted">
            ← Labs
          </Link>
          <span className="eyebrow">Capstone {lab.letter}</span>
          <h1>{lab.title}</h1>
          <p className="lede" style={{ fontSize: '1rem' }}>
            {lab.brief}
          </p>
        </header>
        <section className="section">
          <h2>Checklist</h2>
          <div className="card">
            {lab.checklist.map((item) => (
              <label key={item} className="check-row">
                <input
                  type="checkbox"
                  checked={checks.includes(item)}
                  onChange={() => toggleLabCheck(lab.id, item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
        <section className="section">
          <h2>Your notes</h2>
          <textarea
            className="lab-textarea"
            value={notes}
            onChange={(e) => setLabNotes(lab.id, e.target.value)}
            placeholder="Outline, call sheet bullets, open questions…"
          />
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Saved on this device.
          </p>
        </section>
      </div>
    )
  }

  if (lab.kind === 'implementation') {
    const checks = progress.labChecks[lab.id] ?? []
    const notes = progress.labNotes[lab.id] ?? ''
    return (
      <div>
        <header className="page-header">
          <Link to="/labs" className="muted">
            ← Labs
          </Link>
          <span className="eyebrow">Implementation lab</span>
          <h1>{lab.title}</h1>
          <p className="lede" style={{ fontSize: '1rem' }}>
            {lab.description}
          </p>
        </header>
        <section className="section">
          <h2>Steps</h2>
          <div className="card">
            {lab.steps.map((item) => (
              <label key={item} className="check-row">
                <input
                  type="checkbox"
                  checked={checks.includes(item)}
                  onChange={() => toggleLabCheck(lab.id, item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
        <section className="section">
          <h2>Acceptance</h2>
          <ul>
            {lab.acceptance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="section">
          <h2>Your notes</h2>
          <textarea
            className="lab-textarea"
            value={notes}
            onChange={(e) => setLabNotes(lab.id, e.target.value)}
            placeholder="Call sheet, code sketch, open questions…"
          />
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Saved on this device.
          </p>
        </section>
      </div>
    )
  }

  if (lab.kind === 'decision') {
    const notes = progress.labNotes[lab.id] ?? ''
    return (
      <div>
        <header className="page-header">
          <Link to="/labs" className="muted">
            ← Labs
          </Link>
          <span className="eyebrow">Decision drill</span>
          <h1>{lab.title}</h1>
          <p className="muted">{lab.description}</p>
        </header>
        {lab.scenarios.map((s) => {
          const mastered = progress.decisionCorrect.includes(s.id)
          const picked = decisionPicks[s.id]
          const checked = decisionChecked[s.id] || mastered
          const correct = picked === s.answer || mastered
          return (
            <section key={s.id} className="section">
              <div className="card stack">
                <div className="meta-row">
                  {mastered ? <span className="chip done">Mastered</span> : null}
                </div>
                <p className="drill-prompt">{s.prompt}</p>
                <div className="quiz-choices">
                  {s.choices.map((c) => {
                    let cls = 'quiz-choice'
                    if (checked && c === s.answer) cls += ' correct'
                    if (checked && picked === c && c !== s.answer) cls += ' wrong'
                    return (
                      <button
                        key={c}
                        type="button"
                        className={cls}
                        disabled={mastered || checked}
                        onClick={() =>
                          setDecisionPicks((p) => ({ ...p, [s.id]: c }))
                        }
                        aria-pressed={picked === c}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
                {!mastered && !checked ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!picked}
                    onClick={() => {
                      setDecisionChecked((d) => ({ ...d, [s.id]: true }))
                      if (picked === s.answer) markDecisionCorrect(s.id)
                    }}
                  >
                    Check
                  </button>
                ) : null}
                {checked ? (
                  <div className={`quiz-feedback ${correct ? 'ok' : 'bad'}`}>
                    <strong>{correct ? 'Correct.' : 'Preferred answer:'}</strong>{' '}
                    {!correct ? <em>{s.answer}. </em> : null}
                    {s.rationale}
                    {!mastered && !correct ? (
                      <div className="actions" style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setDecisionChecked((d) => ({ ...d, [s.id]: false }))
                            setDecisionPicks((p) => {
                              const next = { ...p }
                              delete next[s.id]
                              return next
                            })
                          }}
                        >
                          Try again
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          )
        })}
        <section className="section">
          <h2>Your notes</h2>
          <textarea
            className="lab-textarea"
            value={notes}
            onChange={(e) => setLabNotes(lab.id, e.target.value)}
            placeholder="Your picks and rationale…"
          />
        </section>
      </div>
    )
  }

  return null
}
