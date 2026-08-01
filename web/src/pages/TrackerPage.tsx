import { trackerItems } from '../content'
import { DataTransferPanel } from '../components/DataTransferPanel'
import { useProgress } from '../hooks/useProgress'

export function TrackerPage() {
  const { progress, toggleTracker, resetActivePath, activePath } = useProgress()
  const items = trackerItems.filter((t) => t.path === activePath)
  const done = progress.completedTracker.filter((id) => items.some((t) => t.id === id)).length

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {activePath === 'fluency' ? 'Path A' : 'Path B'} · {done} / {items.length}
        </span>
        <h1>Progress tracker</h1>
        <p className="muted">
          Saved in this browser for the active path. Export a backup to move progress to another
          device — the other path’s checkmarks stay when you switch.
        </p>
        <div className="actions" style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (confirm('Reset tracker and progress for this path only?')) resetActivePath()
            }}
          >
            Reset this path
          </button>
        </div>
      </header>

      <div className="card">
        {items.map((item) => {
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

      <DataTransferPanel />
    </div>
  )
}
