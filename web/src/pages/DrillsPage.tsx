import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  allDrills,
  phases,
  implementationModules,
  allImplementationDrills,
} from '../content'
import { useProgress } from '../hooks/useProgress'
import { isPhaseUnlocked, isModuleUnlocked, utcDateString } from '../lib/gamification'

const SPACED_DAYS = 3

function daysSince(dateStr: string | undefined, today: string): number {
  if (!dateStr) return 999
  const ms = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dateStr}T00:00:00Z`)
  return Math.round(ms / 86_400_000)
}

export function DrillsPage() {
  const [params, setParams] = useSearchParams()
  const filter = params.get('phase') ?? params.get('module') ?? 'all'
  const { progress, setDrillRating, activePath } = useProgress()
  const today = utcDateString()

  const drills = useMemo(() => {
    type Row = {
      id: string
      prompt: string
      answer: string
      phaseId: string
      phaseTitle: string
      scopeLabel?: string
      moduleId?: string
    }

    let rows: Row[] = []
    if (activePath === 'fluency') {
      rows = allDrills()
        .filter((d) => isPhaseUnlocked(d.phaseId, progress))
        .map((d) => ({ ...d, scopeLabel: d.phaseTitle }))
    } else {
      rows = allImplementationDrills()
        .filter((d) => isModuleUnlocked(d.moduleId, progress))
        .map((d) => {
          const mod = implementationModules.find((m) => m.id === d.moduleId)
          return {
            ...d,
            phaseId: d.moduleId,
            phaseTitle: mod ? `M${mod.number}` : d.moduleId,
            scopeLabel: mod ? `M${mod.number} ${mod.shortTitle}` : d.moduleId,
          }
        })
    }

    if (filter === 'weak') {
      return rows.filter((d) => progress.drillRatings[d.id] === 'needs-work')
    }
    if (filter === 'revisit') {
      return rows.filter((d) => {
        const rating = progress.drillRatings[d.id]
        if (rating === 'needs-work') return true
        if (rating === 'knew') {
          return daysSince(progress.drillRatedAt[d.id], today) >= SPACED_DAYS
        }
        return false
      })
    }
    if (filter !== 'all') {
      return rows.filter((d) =>
        activePath === 'fluency' ? d.phaseId === filter : d.moduleId === filter,
      )
    }

    // Spaced priority: needs-work and stale "knew" first, then unrated, then fresh knew
    return [...rows].sort((a, b) => {
      const score = (id: string) => {
        const r = progress.drillRatings[id]
        if (r === 'needs-work') return 0
        if (r === 'knew' && daysSince(progress.drillRatedAt[id], today) >= SPACED_DAYS) return 1
        if (!r) return 2
        return 3
      }
      return score(a.id) - score(b.id)
    })
  }, [activePath, filter, progress, today])

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const current = drills[index] ?? null

  const go = (next: number) => {
    setRevealed(false)
    if (drills.length === 0) return
    setIndex(((next % drills.length) + drills.length) % drills.length)
  }

  const scopeOptions =
    activePath === 'fluency'
      ? phases
          .filter((p) => isPhaseUnlocked(p.id, progress))
          .map((p) => ({ value: p.id, label: `Phase ${p.number}: ${p.shortTitle}` }))
      : implementationModules
          .filter((m) => isModuleUnlocked(m.id, progress))
          .map((m) => ({
            value: m.id,
            label: `M${m.number}: ${m.shortTitle}`,
          }))

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {activePath === 'fluency' ? 'Path A · Fluency' : 'Path B · Implementation'}
        </span>
        <h1>Drills</h1>
        <p className="muted">
          Reveal the model answer, then rate yourself. Needs-work and items you marked Knew it
          over {SPACED_DAYS} days ago surface first for spaced revisit.
        </p>
        <div className="actions" style={{ marginTop: '0.75rem' }}>
          <select
            className="lab-input"
            style={{ width: 'auto', minWidth: '12rem' }}
            value={filter}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'all') setParams({})
              else if (v === 'weak' || v === 'revisit') setParams({ phase: v })
              else if (activePath === 'fluency') setParams({ phase: v })
              else setParams({ module: v })
              setIndex(0)
              setRevealed(false)
            }}
            aria-label="Filter drills"
          >
            <option value="all">All (spaced order)</option>
            <option value="revisit">Spaced revisit</option>
            <option value="weak">Needs work only</option>
            {scopeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {!current ? (
        <div className="card">
          <p>
            {filter === 'weak'
              ? 'No weak items yet — practice a few drills and mark some as Needs work.'
              : filter === 'revisit'
                ? 'Nothing due for revisit — keep learning new units.'
                : 'No drills unlocked yet — clear earlier units first.'}
          </p>
          <Link className="btn btn-primary" to="/drills">
            Show all
          </Link>
        </div>
      ) : (
        <div className="card drill-card">
          <div className="meta-row">
            <span className="chip">
              {'scopeLabel' in current && current.scopeLabel
                ? String(current.scopeLabel)
                : current.phaseTitle}
            </span>
            <span className="chip">
              {index + 1} / {drills.length}
            </span>
            {progress.drillRatings[current.id] ? (
              <span
                className={`chip ${progress.drillRatings[current.id] === 'knew' ? 'done' : ''}`}
              >
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
