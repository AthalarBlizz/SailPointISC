import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  curriculumMeta,
  phases,
  tracks,
  implementationModules,
  trackerItems,
} from '../content'
import { DataTransferPanel } from '../components/DataTransferPanel'
import { useProgress } from '../hooks/useProgress'
import {
  activityPercent,
  isPhaseUnlocked,
  isModuleUnlocked,
  nextUnlockHint,
  xpProgressToNext,
} from '../lib/gamification'

export function HomePage() {
  const {
    progress,
    activePath,
    pathChosen,
    choosePath,
    resetActivePath,
    resetAll,
    dual,
    getContinueRoute,
  } = useProgress()

  if (!pathChosen) {
    return (
      <div>
        <header className="hero">
          <span className="eyebrow">Currency {curriculumMeta.currencyDate}</span>
          <h1>Choose your learning path</h1>
          <p className="lede">
            Two complementary paths with XP, ranks, streaks, and unlocks. Swap anytime — progress
            is saved separately for each.
          </p>
        </header>
        <div className="path-picker">
          <button
            type="button"
            className="card path-card"
            onClick={() => {
              choosePath('fluency')
              window.location.hash = '#/'
            }}
          >
            <span className="chip">Path A · ~2–3 weeks</span>
            <h2 style={{ marginTop: '0.65rem' }}>Conversational fluency</h2>
            <p>
              Speak and design like an ISC developer. Phases 0–8, checkpoints, snapshot, and
              design-oriented labs.
            </p>
          </button>
          <button
            type="button"
            className="card path-card"
            onClick={() => {
              choosePath('implementation')
              window.location.hash = '#/'
            }}
          >
            <span className="chip">Path B · ~8–12 weeks</span>
            <h2 style={{ marginTop: '0.65rem' }}>Senior implementation</h2>
            <p>
              Build enterprise integrations across REST, all SDKs, CLI, transforms, rules,
              workflows, connectors, and customizers.
            </p>
          </button>
        </div>
        <p className="muted" style={{ marginTop: '1.5rem' }}>
          Clicks not working?{' '}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              try {
                localStorage.clear()
              } catch {
                /* ignore */
              }
              window.location.href = `${import.meta.env.BASE_URL}#/?fresh=${Date.now()}`
              window.location.reload()
            }}
          >
            Clear saved data and reload
          </button>
        </p>
        <DataTransferPanel compact />
      </div>
    )
  }

  const pathTrackers = trackerItems.filter((t) => t.path === activePath)
  const trackerDone = progress.completedTracker.filter((id) =>
    pathTrackers.some((t) => t.id === id),
  ).length
  const pct = activityPercent(activePath, progress)
  const xpInfo = xpProgressToNext(progress.xp, activePath)
  const nextHint = nextUnlockHint(activePath, progress)
  const clearedCount = progress.clearedUnits.length

  if (activePath === 'fluency') {
    const continueTo = getContinueRoute('/phase/phase-0')

    return (
      <HomeShell
        title={curriculumMeta.title}
        subtitle={curriculumMeta.subtitle}
        outcome={curriculumMeta.outcome}
        continueTo={continueTo}
        pct={pct}
        trackerDone={trackerDone}
        trackerTotal={pathTrackers.length}
        itemLabel={`${clearedCount} of ${phases.length} phases cleared`}
        xpLabel={`${xpInfo.current.label} · ${progress.xp} XP · streak ${progress.streakDays}d`}
        nextHint={
          nextHint
            ? `Up next: Phase ${(nextHint.unit as (typeof phases)[0]).number} — ${nextHint.unit.shortTitle}`
            : progress.clearedUnits.length >= phases.length
              ? 'All phases cleared — keep drilling and earn badges.'
              : null
        }
        otherPathProgress={dual.implementation.clearedUnits.length}
        onResetPath={() => {
          if (confirm('Reset Fluency path progress on this device?')) resetActivePath()
        }}
        onResetAll={() => {
          if (confirm('Reset ALL paths and show path picker again?')) resetAll()
        }}
        onSwitch={() => choosePath('implementation')}
        switchLabel="Switch to Implementation"
      >
        <section className="section">
          <h2>Learning path</h2>
          <div className="card-grid">
            {phases.map((p) => {
              const unlocked = isPhaseUnlocked(p.id, progress)
              const cleared = progress.clearedUnits.includes(p.id)
              const done = progress.completedItems.includes(p.id)
              if (!unlocked) {
                return (
                  <div key={p.id} className="card card-locked">
                    <div className="meta-row">
                      <span className="chip">Phase {p.number}</span>
                      <span className="chip">Locked</span>
                    </div>
                    <h3 style={{ marginTop: '0.65rem' }}>{p.title}</h3>
                    <p>{p.goal}</p>
                  </div>
                )
              }
              return (
                <Link key={p.id} to={`/phase/${p.id}`} className="card card-link">
                  <div className="meta-row">
                    <span className="chip">Phase {p.number}</span>
                    <span className="chip">{p.estTime}</span>
                    {cleared ? <span className="chip done">Cleared</span> : null}
                    {!cleared && done ? <span className="chip done">Complete</span> : null}
                  </div>
                  <h3 style={{ marginTop: '0.65rem' }}>{p.title}</h3>
                  <p>{p.goal}</p>
                </Link>
              )
            })}
          </div>
        </section>
        <SharedPractice />
      </HomeShell>
    )
  }

  const continueTo = getContinueRoute('/module/m0')

  return (
    <HomeShell
      title="Senior implementation curriculum"
      subtitle="Enterprise ISC engineering across APIs, SDKs, and extensibility"
      outcome="Design, implement, review, and operate ISC integrations at a senior enterprise level."
      continueTo={continueTo}
      pct={pct}
      trackerDone={trackerDone}
      trackerTotal={pathTrackers.length}
      itemLabel={`${clearedCount} of ${implementationModules.length} modules cleared`}
      xpLabel={`${xpInfo.current.label} · ${progress.xp} XP · streak ${progress.streakDays}d`}
      nextHint={
        nextHint
          ? `Up next: M${(nextHint.unit as (typeof implementationModules)[0]).number} — ${nextHint.unit.shortTitle}`
          : progress.clearedUnits.length >= implementationModules.length
            ? 'All modules cleared — ship capstones and chase badges.'
            : null
      }
      otherPathProgress={dual.fluency.clearedUnits.length}
      onResetPath={() => {
        if (confirm('Reset Implementation path progress on this device?')) resetActivePath()
      }}
      onResetAll={() => {
        if (confirm('Reset ALL paths and show path picker again?')) resetAll()
      }}
      onSwitch={() => choosePath('fluency')}
      switchLabel="Switch to Fluency"
    >
      <section className="section">
        <h2>Tracks</h2>
        <div className="card-grid">
          {tracks.map((t) => {
            const mods = t.moduleIds
              .map((id) => implementationModules.find((m) => m.id === id))
              .filter(Boolean)
            const doneCount = mods.filter((m) =>
              progress.clearedUnits.includes(m!.id),
            ).length
            const firstOpen = t.moduleIds.find((id) => isModuleUnlocked(id, progress))
            return (
              <div key={t.id} className="card">
                <div className="meta-row">
                  <span className="chip">Track {t.number}</span>
                  <span className="chip done">
                    {doneCount}/{mods.length}
                  </span>
                </div>
                <h3 style={{ marginTop: '0.65rem' }}>{t.title}</h3>
                <p>{t.description}</p>
                <div className="actions" style={{ marginTop: '0.75rem' }}>
                  {firstOpen ? (
                    <Link className="btn btn-ghost" to={`/module/${firstOpen}`}>
                      Open track
                    </Link>
                  ) : (
                    <span className="muted">Locked — clear prior track</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <SharedPractice />
    </HomeShell>
  )
}

function SharedPractice() {
  return (
    <section className="section">
      <h2>Practice</h2>
      <div className="card-grid two">
        <Link to="/labs" className="card card-link">
          <h3>Labs</h3>
          <p>Versioning, filters, implementation builds, and capstones.</p>
        </Link>
        <Link to="/drills" className="card card-link">
          <h3>Drills</h3>
          <p>Self-rated checkpoints with spaced revisit for this path.</p>
        </Link>
        <Link to="/achievements" className="card card-link">
          <h3>Achievements</h3>
          <p>XP, ranks, streaks, and badges.</p>
        </Link>
        <Link to="/snapshot" className="card card-link">
          <h3>July 2026 snapshot</h3>
          <p>Shared versioning cheat sheet for both paths.</p>
        </Link>
      </div>
    </section>
  )
}

function HomeShell({
  title,
  subtitle,
  outcome,
  continueTo,
  pct,
  trackerDone,
  trackerTotal,
  itemLabel,
  xpLabel,
  nextHint,
  otherPathProgress,
  onResetPath,
  onResetAll,
  onSwitch,
  switchLabel,
  children,
}: {
  title: string
  subtitle: string
  outcome: string
  continueTo: string
  pct: number
  trackerDone: number
  trackerTotal: number
  itemLabel: string
  xpLabel: string
  nextHint: string | null
  otherPathProgress: number
  onResetPath: () => void
  onResetAll: () => void
  onSwitch: () => void
  switchLabel: string
  children: ReactNode
}) {
  return (
    <div>
      <header className="hero">
        <span className="eyebrow">Currency {curriculumMeta.currencyDate}</span>
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
        <p className="lede" style={{ fontSize: '0.95rem' }}>
          {outcome}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" to={continueTo}>
            Continue learning
          </Link>
          <button type="button" className="btn btn-ghost" onClick={onSwitch}>
            {switchLabel}
          </button>
          <Link className="btn btn-ghost" to="/achievements">
            Achievements
          </Link>
        </div>
      </header>

      <section className="card section">
        <div className="progress-panel">
          <div className="ring" style={{ ['--pct' as string]: pct }} aria-hidden>
            <div className="ring-inner">{pct}%</div>
          </div>
          <div>
            <h2 style={{ marginTop: 0 }}>Your progress (this path)</h2>
            <p className="muted">{xpLabel}</p>
            <p className="muted">
              {itemLabel} · {trackerDone} of {trackerTotal} tracker items
            </p>
            {nextHint ? (
              <p className="muted" style={{ marginTop: '0.35rem' }}>
                {nextHint}
              </p>
            ) : null}
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              Other path: {otherPathProgress} units cleared (preserved when you switch).
            </p>
            <div className="actions" style={{ marginTop: '0.85rem' }}>
              <Link className="btn btn-ghost" to="/tracker">
                Open tracker
              </Link>
              <button type="button" className="btn btn-ghost" onClick={onResetPath}>
                Reset this path
              </button>
              <button type="button" className="btn btn-ghost" onClick={onResetAll}>
                Reset all
              </button>
            </div>
          </div>
        </div>
      </section>
      <DataTransferPanel />
      {children}
    </div>
  )
}
