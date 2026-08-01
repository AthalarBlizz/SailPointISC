import { Link } from 'react-router-dom'
import { labs } from '../content'
import { useProgress } from '../hooks/useProgress'

export function LabsIndexPage() {
  const { progress } = useProgress()

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">Guided practice</span>
        <h1>Labs</h1>
        <p className="muted">
          Versioning mapper, filter drill, and capstone briefs with on-device checklists.
        </p>
      </header>
      <div className="card-grid">
        {labs.map((lab) => {
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
