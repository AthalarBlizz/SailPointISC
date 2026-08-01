import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPhase, phases, getLab, getModule } from '../content'
import { ContentBlocks } from '../components/ContentBlocks'
import { ListenBar } from '../components/ListenBar'
import { useProgress } from '../hooks/useProgress'
import {
  isPhaseUnlocked,
  canClearUnit,
  quizIdsInSections,
} from '../lib/gamification'
import { buildListenScript, phaseToListenUnit } from '../lib/narration'

export function PhasePage() {
  const { phaseId } = useParams()
  const phase = getPhase(phaseId ?? '')
  const { progress, toggleItemComplete, setActivePath, tryClearUnit } = useProgress()
  const [listening, setListening] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>()

  useEffect(() => {
    if (!phase) return
    if (canClearUnit(progress, phase.sections, phase.checkpoints)) {
      tryClearUnit(phase.id, phase.sections, phase.checkpoints)
    }
  }, [phase, progress, tryClearUnit])

  useEffect(() => {
    setListening(false)
    setActiveSectionId(undefined)
    window.speechSynthesis?.cancel()
  }, [phaseId])

  const utterances = useMemo(
    () => (phase ? buildListenScript(phaseToListenUnit(phase)) : []),
    [phase],
  )
  const sectionTitles = useMemo(() => {
    const m: Record<string, string> = {}
    phase?.sections.forEach((s) => {
      m[s.id] = s.title
    })
    return m
  }, [phase])

  const onSectionChange = useCallback((id: string | undefined) => {
    setActiveSectionId(id)
    if (!id) return
    const el = document.getElementById(`section-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (!phase) {
    return (
      <div>
        <h1>Phase not found</h1>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  const unlocked = isPhaseUnlocked(phase.id, progress)
  const idx = phases.findIndex((p) => p.id === phase.id)
  const prev = idx > 0 ? phases[idx - 1] : null
  const next = idx < phases.length - 1 ? phases[idx + 1] : null
  const done = progress.completedItems.includes(phase.id)
  const cleared = progress.clearedUnits.includes(phase.id)
  const quizIds = quizIdsInSections(phase.sections)
  const quizzesPassed = quizIds.filter((id) => progress.sectionChecks.includes(id)).length
  const drillsRated = phase.checkpoints.filter((c) => progress.drillRatings[c.id] != null).length

  if (!unlocked) {
    return (
      <div>
        <header className="page-header">
          <span className="eyebrow">Locked</span>
          <h1>{phase.title}</h1>
          <p className="muted">{phase.goal}</p>
          <div className="callout warn">
            <strong>Clear the previous phase first</strong>
            <span>
              Pass section micro-checks and rate checkpoints on{' '}
              {prev ? (
                <Link to={`/phase/${prev.id}`}>{prev.shortTitle}</Link>
              ) : (
                'the prior unit'
              )}{' '}
              to unlock this phase.
            </span>
          </div>
        </header>
        <section className="section">
          <h2>Learning outcomes (preview)</h2>
          <ul className="block-list">
            {phase.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  return (
    <div className={listening ? 'listening-active' : undefined}>
      <header className="page-header">
        <span className="eyebrow">
          Phase {phase.number} · {phase.estTime}
        </span>
        <h1>{phase.title}</h1>
        <p className="muted">{phase.goal}</p>
        <div className="meta-row" style={{ marginTop: '0.75rem' }}>
          {cleared ? <span className="chip done">Cleared</span> : null}
          {quizIds.length > 0 ? (
            <span className="chip">
              Checks {quizzesPassed}/{quizIds.length}
            </span>
          ) : null}
          <span className="chip">
            Drills {drillsRated}/{phase.checkpoints.length}
          </span>
        </div>
        <div className="actions" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className={listening ? 'btn btn-success' : 'btn btn-primary'}
            onClick={() => setListening(true)}
          >
            {listening ? 'Listening…' : 'Listen'}
          </button>
          <button
            type="button"
            className={done ? 'btn btn-success' : 'btn btn-ghost'}
            onClick={() => toggleItemComplete(phase.id)}
          >
            {done ? 'Marked complete' : 'Mark phase complete'}
          </button>
          <Link className="btn btn-ghost" to={`/drills?phase=${phase.id}`}>
            Practice checkpoints
          </Link>
        </div>
        {!cleared ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Clear this phase by passing all micro-checks and rating every checkpoint (Knew it or
            Needs work) to unlock the next unit (+40 XP).
          </p>
        ) : null}
      </header>

      <section className="section">
        <h2>Learning outcomes</h2>
        <ul className="block-list">
          {phase.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      {phase.sections.map((section) => (
        <section
          key={section.id}
          id={`section-${section.id}`}
          className={`section${activeSectionId === section.id ? ' section-speaking' : ''}`}
        >
          <h2>{section.title}</h2>
          <ContentBlocks blocks={section.blocks} />
        </section>
      ))}

      {phase.labs && phase.labs.length > 0 ? (
        <section className="section">
          <h2>Related labs</h2>
          <div className="card-grid">
            {phase.labs.map((labId) => {
              const lab = getLab(labId)
              if (!lab) return null
              return (
                <Link key={labId} to={`/labs/${labId}`} className="card card-link">
                  <h3>{lab.title}</h3>
                  <p className="muted">
                    {lab.kind === 'capstone'
                      ? lab.brief.slice(0, 120) + '…'
                      : 'description' in lab
                        ? lab.description
                        : ''}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {phase.deepenModules && phase.deepenModules.length > 0 ? (
        <section className="section">
          <div className="callout tip">
            <strong>Go deeper (Path B)</strong>
            <ul className="block-list" style={{ marginTop: '0.5rem' }}>
              {phase.deepenModules.map((mid) => {
                const mod = getModule(mid)
                if (!mod) return null
                return (
                  <li key={mid}>
                    <Link
                      to={`/module/${mid}`}
                      onClick={() => setActivePath('implementation')}
                    >
                      M{mod.number}: {mod.shortTitle}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2>Conversational checkpoints</h2>
        <p className="muted">Self-test these prompts — or run them in Drill mode.</p>
        <ul className="block-list">
          {phase.checkpoints.map((c) => (
            <li key={c.id}>
              {c.prompt}{' '}
              {progress.drillRatings[c.id] ? (
                <span className="chip done">Rated</span>
              ) : (
                <span className="chip">Unrated</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="phase-nav">
        {prev ? (
          <Link className="btn btn-ghost" to={`/phase/${prev.id}`}>
            ← {prev.shortTitle}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          isPhaseUnlocked(next.id, progress) ? (
            <Link className="btn btn-ghost" to={`/phase/${next.id}`}>
              {next.shortTitle} →
            </Link>
          ) : (
            <span className="muted">Clear this phase to unlock {next.shortTitle}</span>
          )
        ) : (
          <Link className="btn btn-primary" to="/labs">
            Go to labs
          </Link>
        )}
      </div>

      {listening ? (
        <ListenBar
          utterances={utterances}
          sectionTitles={sectionTitles}
          onSectionChange={onSectionChange}
          onClose={() => {
            window.speechSynthesis?.cancel()
            setListening(false)
            setActiveSectionId(undefined)
          }}
        />
      ) : null}
    </div>
  )
}
