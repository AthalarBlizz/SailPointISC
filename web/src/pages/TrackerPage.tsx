import { trackerItems } from '../content'
import { useProgress } from '../hooks/useProgress'

export function TrackerPage() {
  const { progress, toggleTracker, reset } = useProgress()
  const done = progress.completedTracker.length

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {done} / {trackerItems.length}
        </span>
        <h1>Progress tracker</h1>
        <p className="muted">Saved on this device only (localStorage). Syncs across tabs on the same browser.</p>
        <div className="actions" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (confirm('Reset all local progress?')) reset()
            }}
          >
            Reset all progress
          </button>
        </div>
      </header>

      <div className="card">
        {trackerItems.map((item) => {
          const checked = progress.completedTracker.includes(item.id)
          return (
            <label key={item.id} className="check-row">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTracker(item.id)}
              />
              <span>{item.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
