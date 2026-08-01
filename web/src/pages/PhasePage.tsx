import { Link, useParams } from 'react-router-dom'
import { getPhase, phases, getLab, getModule } from '../content'
import { ContentBlocks } from '../components/ContentBlocks'
import { useProgress } from '../hooks/useProgress'

export function PhasePage() {
  const { phaseId } = useParams()
  const phase = getPhase(phaseId ?? '')
  const { progress, toggleItemComplete, setActivePath } = useProgress()

  if (!phase) {
    return (
      <div>
        <h1>Phase not found</h1>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  const idx = phases.findIndex((p) => p.id === phase.id)
  const prev = idx > 0 ? phases[idx - 1] : null
  const next = idx < phases.length - 1 ? phases[idx + 1] : null
  const done = progress.completedItems.includes(phase.id)

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          Phase {phase.number} · {phase.estTime}
        </span>
        <h1>{phase.title}</h1>
        <p className="muted">{phase.goal}</p>
        <div className="actions" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className={done ? 'btn btn-success' : 'btn btn-primary'}
            onClick={() => toggleItemComplete(phase.id)}
          >
            {done ? 'Marked complete' : 'Mark phase complete'}
          </button>
          <Link className="btn btn-ghost" to={`/drills?phase=${phase.id}`}>
            Practice checkpoints
          </Link>
        </div>
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
        <section key={section.id} className="section">
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
            <li key={c.id}>{c.prompt}</li>
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
          <Link className="btn btn-ghost" to={`/phase/${next.id}`}>
            {next.shortTitle} →
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
