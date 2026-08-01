import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import {
  getModule,
  implementationModules,
  tracks,
  getLab,
  getPhase,
} from '../content'
import { ContentBlocks } from '../components/ContentBlocks'
import { useProgress } from '../hooks/useProgress'
import {
  isModuleUnlocked,
  canClearUnit,
  quizIdsInSections,
} from '../lib/gamification'

export function ModulePage() {
  const { moduleId } = useParams()
  const mod = getModule(moduleId ?? '')
  const { progress, toggleItemComplete, setActivePath, tryClearUnit } = useProgress()

  useEffect(() => {
    if (!mod) return
    if (canClearUnit(progress, mod.sections, mod.checkpoints)) {
      tryClearUnit(mod.id, mod.sections, mod.checkpoints)
    }
  }, [mod, progress, tryClearUnit])

  if (!mod) {
    return (
      <div>
        <h1>Module not found</h1>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  const unlocked = isModuleUnlocked(mod.id, progress)
  const track = tracks.find((t) => t.id === mod.trackId)
  const idx = implementationModules.findIndex((m) => m.id === mod.id)
  const prev = idx > 0 ? implementationModules[idx - 1] : null
  const next =
    idx < implementationModules.length - 1 ? implementationModules[idx + 1] : null
  const done = progress.completedItems.includes(mod.id)
  const cleared = progress.clearedUnits.includes(mod.id)
  const fluency = mod.fluencyPhaseId ? getPhase(mod.fluencyPhaseId) : null
  const quizIds = quizIdsInSections(mod.sections)
  const quizzesPassed = quizIds.filter((id) => progress.sectionChecks.includes(id)).length
  const drillsRated = mod.checkpoints.filter((c) => progress.drillRatings[c.id] != null).length

  if (!unlocked) {
    return (
      <div>
        <header className="page-header">
          <span className="eyebrow">Locked</span>
          <h1>{mod.title}</h1>
          <p className="muted">{mod.goal}</p>
          <div className="callout warn">
            <strong>Clear the previous module first</strong>
            <span>
              Finish micro-checks and rate checkpoints on{' '}
              {prev ? (
                <Link to={`/module/${prev.id}`}>
                  M{prev.number} {prev.shortTitle}
                </Link>
              ) : (
                'the prior module'
              )}{' '}
              to unlock this unit.
            </span>
          </div>
        </header>
        <section className="section">
          <h2>Senior outcomes (preview)</h2>
          <ul className="block-list">
            {mod.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {track?.shortTitle ?? 'Path B'} · M{mod.number} · {mod.estTime}
        </span>
        <h1>{mod.title}</h1>
        <p className="muted">{mod.goal}</p>
        <div className="meta-row" style={{ marginTop: '0.75rem' }}>
          {cleared ? <span className="chip done">Cleared</span> : null}
          {quizIds.length > 0 ? (
            <span className="chip">
              Checks {quizzesPassed}/{quizIds.length}
            </span>
          ) : null}
          <span className="chip">
            Drills {drillsRated}/{mod.checkpoints.length}
          </span>
        </div>
        <div className="actions" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className={done ? 'btn btn-success' : 'btn btn-primary'}
            onClick={() => toggleItemComplete(mod.id)}
          >
            {done ? 'Marked complete' : 'Mark module complete'}
          </button>
          <Link className="btn btn-ghost" to={`/drills?module=${mod.id}`}>
            Practice drills
          </Link>
        </div>
        {!cleared ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Clear this module by passing all micro-checks and rating every checkpoint to unlock the
            next unit (+40 XP).
          </p>
        ) : null}
      </header>

      <section className="section">
        <h2>Senior outcomes</h2>
        <ul className="block-list">
          {mod.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>When to use</h2>
        <ul className="block-list">
          {mod.whenToUse.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <h2 style={{ marginTop: '1.25rem' }}>When not</h2>
        <ul className="block-list">
          {mod.whenNot.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      {mod.sections.map((section) => (
        <section key={section.id} className="section">
          <h2>{section.title}</h2>
          <ContentBlocks blocks={section.blocks} />
        </section>
      ))}

      <section className="section">
        <h2>Failure modes</h2>
        <ul className="block-list">
          {mod.failureModes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Enterprise checklist</h2>
        <ul className="block-list">
          {mod.enterpriseChecklist.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      {mod.labs && mod.labs.length > 0 ? (
        <section className="section">
          <h2>Related labs</h2>
          <div className="card-grid">
            {mod.labs.map((labId) => {
              const lab = getLab(labId)
              if (!lab) return null
              return (
                <Link key={labId} to={`/labs/${labId}`} className="card card-link">
                  <h3>{lab.title}</h3>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {fluency ? (
        <section className="section">
          <div className="callout tip">
            <strong>Fluency refresh</strong>
            <span>
              Revisit Path A{' '}
              <Link
                to={`/phase/${fluency.id}`}
                onClick={() => setActivePath('fluency')}
              >
                Phase {fluency.number}: {fluency.shortTitle}
              </Link>{' '}
              for conversational checkpoints on this topic.
            </span>
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2>Checkpoints</h2>
        <ul className="block-list">
          {mod.checkpoints.map((c) => (
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
          <Link className="btn btn-ghost" to={`/module/${prev.id}`}>
            ← M{prev.number} {prev.shortTitle}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          isModuleUnlocked(next.id, progress) ? (
            <Link className="btn btn-ghost" to={`/module/${next.id}`}>
              M{next.number} {next.shortTitle} →
            </Link>
          ) : (
            <span className="muted">Clear this module to unlock M{next.number}</span>
          )
        ) : (
          <Link className="btn btn-primary" to="/labs">
            Go to labs
          </Link>
        )}
      </div>
    </div>
  )
}
