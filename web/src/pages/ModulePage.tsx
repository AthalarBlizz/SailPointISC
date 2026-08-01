import { Link, useParams } from 'react-router-dom'
import {
  getModule,
  implementationModules,
  tracks,
  getLab,
  getPhase,
} from '../content'
import { ContentBlocks } from '../components/ContentBlocks'
import { useProgress } from '../hooks/useProgress'

export function ModulePage() {
  const { moduleId } = useParams()
  const mod = getModule(moduleId ?? '')
  const { progress, toggleItemComplete, setActivePath } = useProgress()

  if (!mod) {
    return (
      <div>
        <h1>Module not found</h1>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  const track = tracks.find((t) => t.id === mod.trackId)
  const idx = implementationModules.findIndex((m) => m.id === mod.id)
  const prev = idx > 0 ? implementationModules[idx - 1] : null
  const next =
    idx < implementationModules.length - 1 ? implementationModules[idx + 1] : null
  const done = progress.completedItems.includes(mod.id)
  const fluency = mod.fluencyPhaseId ? getPhase(mod.fluencyPhaseId) : null

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {track?.shortTitle ?? 'Path B'} · M{mod.number} · {mod.estTime}
        </span>
        <h1>{mod.title}</h1>
        <p className="muted">{mod.goal}</p>
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
            <li key={c.id}>{c.prompt}</li>
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
          <Link className="btn btn-ghost" to={`/module/${next.id}`}>
            M{next.number} {next.shortTitle} →
          </Link>
        ) : (
          <Link className="btn btn-primary" to="/labs">
            Go to labs
          </Link>
        )}
      </div>
    </div>
  )
}
