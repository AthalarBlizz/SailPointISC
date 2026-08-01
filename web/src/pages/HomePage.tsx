import { Link } from 'react-router-dom'
import { curriculumMeta, phases, trackerItems } from '../content'
import { useProgress } from '../hooks/useProgress'

export function HomePage() {
  const { progress, reset } = useProgress()
  const phaseDone = progress.completedPhases.length
  const trackerDone = progress.completedTracker.length
  const pct = Math.round((trackerDone / trackerItems.length) * 100)
  const continueTo = progress.lastRoute && progress.lastRoute !== '/' ? progress.lastRoute : '/phase/phase-0'

  return (
    <div>
      <header className="hero">
        <span className="eyebrow">Currency {curriculumMeta.currencyDate}</span>
        <h1>{curriculumMeta.title}</h1>
        <p className="lede">{curriculumMeta.subtitle}</p>
        <p className="lede" style={{ fontSize: '0.95rem' }}>
          {curriculumMeta.outcome}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" to={continueTo}>
            Continue learning
          </Link>
          <Link className="btn btn-ghost" to="/snapshot">
            July 2026 snapshot
          </Link>
          <Link className="btn btn-ghost" to="/drills">
            Practice drills
          </Link>
        </div>
      </header>

      <section className="card section">
        <div className="progress-panel">
          <div className="ring" style={{ ['--pct' as string]: pct }} aria-hidden>
            <div className="ring-inner">{pct}%</div>
          </div>
          <div>
            <h2 style={{ marginTop: 0 }}>Your progress</h2>
            <p className="muted">
              {trackerDone} of {trackerItems.length} tracker items · {phaseDone} of{' '}
              {phases.length} phases marked complete
            </p>
            <div className="actions" style={{ marginTop: '0.85rem' }}>
              <Link className="btn btn-ghost" to="/tracker">
                Open tracker
              </Link>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (confirm('Reset all local progress on this device?')) reset()
                }}
              >
                Reset progress
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Learning path</h2>
        <div className="card-grid">
          {phases.map((p) => {
            const done = progress.completedPhases.includes(p.id)
            return (
              <Link key={p.id} to={`/phase/${p.id}`} className="card card-link">
                <div className="meta-row">
                  <span className="chip">Phase {p.number}</span>
                  <span className="chip">{p.estTime}</span>
                  {done ? <span className="chip done">Complete</span> : null}
                </div>
                <h3 style={{ marginTop: '0.65rem' }}>{p.title}</h3>
                <p>{p.goal}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section">
        <h2>Practice</h2>
        <div className="card-grid two">
          <Link to="/labs/lab-versioning" className="card card-link">
            <h3>Versioning lab</h3>
            <p>Map legacy yearly paths to per-service v1/v2.</p>
          </Link>
          <Link to="/labs/lab-filters" className="card card-link">
            <h3>Filter drill</h3>
            <p>Practice standard collection filter syntax.</p>
          </Link>
          <Link to="/labs" className="card card-link">
            <h3>Capstone briefs</h3>
            <p>A–D with checklists and notes saved on-device.</p>
          </Link>
          <Link to="/glossary" className="card card-link">
            <h3>Glossary</h3>
            <p>PAT, JML, per-service v1, and more.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
