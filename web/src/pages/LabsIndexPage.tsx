import { Link } from 'react-router-dom'
import { labs } from '../content'
import { useProgress } from '../hooks/useProgress'

export function LabsIndexPage() {
  const { progress, activePath } = useProgress()
  const visible = labs.filter(
    (lab) => lab.path === 'both' || lab.path === activePath,
  )

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {activePath === 'fluency' ? 'Path A + shared' : 'Path B + shared'}
        </span>
        <h1>Labs</h1>
        <p className="muted">
          Shared labs appear on both paths. Implementation-only builds show when Path B is active.
        </p>
      </header>
      <div className="card-grid">
        {visible.map((lab) => {
          if (lab.kind === 'versioning') {
            const done = progress.versioningCorrect.length
            const total = lab.items.length
            return (
              <Link key={lab.id} to={`/labs/${lab.id}`} className="card card-link">
                <span className="chip">Versioning</span>
                <h3 style={{ marginTop: '0.5rem' }}>{lab.title}</h3>
                <p>
                  {done}/{total} mastered
                </p>
              </Link>
            )
          }
          if (lab.kind === 'filters') {
            const done = progress.filterCorrect.length
            const total = lab.items.length
            return (
              <Link key={lab.id} to={`/labs/${lab.id}`} className="card card-link">
                <span className="chip">Filters</span>
                <h3 style={{ marginTop: '0.5rem' }}>{lab.title}</h3>
                <p>
                  {done}/{total} correct
                </p>
              </Link>
            )
          }
          if (lab.kind === 'implementation') {
            const checks = progress.labChecks[lab.id] ?? []
            return (
              <Link key={lab.id} to={`/labs/${lab.id}`} className="card card-link">
                <span className="chip">Implementation</span>
                <h3 style={{ marginTop: '0.5rem' }}>{lab.title}</h3>
                <p>
                  {checks.length}/{lab.steps.length} steps
                </p>
              </Link>
            )
          }
          if (lab.kind === 'decision') {
            return (
              <Link key={lab.id} to={`/labs/${lab.id}`} className="card card-link">
                <span className="chip">Decision</span>
                <h3 style={{ marginTop: '0.5rem' }}>{lab.title}</h3>
                <p>{lab.scenarios.length} scenarios</p>
              </Link>
            )
          }
          const checks = progress.labChecks[lab.id] ?? []
          return (
            <Link key={lab.id} to={`/labs/${lab.id}`} className="card card-link">
              <span className="chip">Capstone {lab.letter}</span>
              <h3 style={{ marginTop: '0.5rem' }}>{lab.title}</h3>
              <p>
                {checks.length}/{lab.checklist.length} checklist items
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
