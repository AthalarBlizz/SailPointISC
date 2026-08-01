import { Link } from 'react-router-dom'
import { badges } from '../content/badges'
import { useProgress } from '../hooks/useProgress'
import { ranksForPath, xpProgressToNext } from '../lib/gamification'

export function AchievementsPage() {
  const { progress, activePath } = useProgress()
  const { current, next, intoRank, span, ratio } = xpProgressToNext(progress.xp, activePath)
  const ranks = ranksForPath(activePath)
  const catalog = badges.filter((b) => b.path === 'both' || b.path === activePath)
  const titleById = Object.fromEntries(catalog.map((b) => [b.id, b.title]))

  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">
          {activePath === 'fluency' ? 'Path A · Fluency' : 'Path B · Implementation'}
        </span>
        <h1>Achievements</h1>
        <p className="muted">
          XP, ranks, streaks, and badges for this path. Everything stays on this device.
        </p>
      </header>

      <section className="card section stack">
        <div className="meta-row">
          <span className="chip done">{current.label}</span>
          <span className="chip">{progress.xp} XP</span>
          <span className="chip">
            Streak {progress.streakDays} day{progress.streakDays === 1 ? '' : 's'}
          </span>
        </div>
        {next ? (
          <>
            <p className="muted" style={{ margin: 0 }}>
              {intoRank} / {span} XP to {next.label}
            </p>
            <div className="xp-bar" aria-hidden>
              <div className="xp-bar-fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
            </div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Max rank reached.
          </p>
        )}
        {progress.earnedBadges.length > 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Latest:{' '}
            {progress.earnedBadges
              .slice(-3)
              .map((id) => titleById[id] ?? id)
              .join(' · ')}
          </p>
        ) : null}
      </section>

      <section className="section">
        <h2>Rank ladder</h2>
        <ol className="rank-ladder">
          {ranks.map((r) => {
            const reached = progress.xp >= r.minXp
            return (
              <li key={r.id} className={reached ? 'reached' : ''}>
                <strong>{r.label}</strong>
                <span className="muted">{r.minXp}+ XP</span>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="section">
        <h2>Badges</h2>
        <div className="card-grid">
          {catalog.map((b) => {
            const earned = progress.earnedBadges.includes(b.id)
            return (
              <div key={b.id} className={`card badge-card${earned ? ' earned' : ' locked'}`}>
                <div className="meta-row">
                  <span className={`chip${earned ? ' done' : ''}`}>
                    {earned ? 'Earned' : 'Locked'}
                  </span>
                </div>
                <h3 style={{ marginTop: '0.65rem' }}>{b.title}</h3>
                <p>{b.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <p className="muted">
        <Link to="/">← Back home</Link>
      </p>
    </div>
  )
}
