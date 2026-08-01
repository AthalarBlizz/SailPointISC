import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  curriculumMeta,
  phases,
  tracks,
  implementationModules,
  trackerItems,
} from '../content'
import { useProgress } from '../hooks/useProgress'

export function HomePage() {
  const {
    progress,
    activePath,
    pathChosen,
    choosePath,
    resetActivePath,
    resetAll,
    dual,
  } = useProgress()

  if (!pathChosen) {
    return (
      <div>
        <header className="hero">
          <span className="eyebrow">Currency {curriculumMeta.currencyDate}</span>
          <h1>Choose your learning path</h1>
          <p className="lede">
            Two complementary paths. Swap anytime from the top bar — progress is saved separately
            for each.
          </p>
        </header>
        <div className="path-picker">
          <button
            type="button"
            className="card path-card"
            onClick={() => choosePath('fluency')}
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
            onClick={() => choosePath('implementation')}
          >
            <span className="chip">Path B · ~8–12 weeks</span>
            <h2 style={{ marginTop: '0.65rem' }}>Senior implementation</h2>
            <p>
              Build enterprise integrations across REST, all SDKs, CLI, transforms, rules,
              workflows, connectors, and customizers.
            </p>
          </button>
        </div>
      </div>
    )
  }

  const pathTrackers = trackerItems.filter((t) => t.path === activePath)
  const trackerDone = progress.completedTracker.filter((id) =>
    pathTrackers.some((t) => t.id === id),
  ).length
  const pct =
    pathTrackers.length === 0 ? 0 : Math.round((trackerDone / pathTrackers.length) * 100)

  if (activePath === 'fluency') {
    const phaseDone = progress.completedItems.length
    const continueTo =
      progress.lastRoute && progress.lastRoute !== '/'
        ? progress.lastRoute
        : '/phase/phase-0'

    return (
      <HomeShell
        title={curriculumMeta.title}
        subtitle={curriculumMeta.subtitle}
        outcome={curriculumMeta.outcome}
        continueTo={continueTo}
        pct={pct}
        trackerDone={trackerDone}
        trackerTotal={pathTrackers.length}
        itemLabel={`${phaseDone} of ${phases.length} phases marked complete`}
        otherPathProgress={dual.implementation.completedItems.length}
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
              const done = progress.completedItems.includes(p.id)
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
        <SharedPractice />
      </HomeShell>
    )
  }

  const modDone = progress.completedItems.length
  const continueTo =
    progress.lastRoute && progress.lastRoute !== '/'
      ? progress.lastRoute
      : '/module/m0'

  return (
    <HomeShell
      title="Senior implementation curriculum"
      subtitle="Enterprise ISC engineering across APIs, SDKs, and extensibility"
      outcome="Design, implement, review, and operate ISC integrations at a senior enterprise level."
      continueTo={continueTo}
      pct={pct}
      trackerDone={trackerDone}
      trackerTotal={pathTrackers.length}
      itemLabel={`${modDone} of ${implementationModules.length} modules marked complete`}
      otherPathProgress={dual.fluency.completedItems.length}
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
              progress.completedItems.includes(m!.id),
            ).length
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
                  <Link className="btn btn-ghost" to={`/module/${t.moduleIds[0]}`}>
                    Open track
                  </Link>
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
          <p>Self-rated checkpoints for the active path.</p>
        </Link>
        <Link to="/snapshot" className="card card-link">
          <h3>July 2026 snapshot</h3>
          <p>Shared versioning cheat sheet for both paths.</p>
        </Link>
        <Link to="/glossary" className="card card-link">
          <h3>Glossary</h3>
          <p>Shared vocabulary for conversations and reviews.</p>
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
          <Link className="btn btn-ghost" to="/snapshot">
            Snapshot
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
            <p className="muted">
              {trackerDone} of {trackerTotal} tracker items · {itemLabel}
            </p>
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              Other path: {otherPathProgress} items completed (preserved when you switch).
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
      {children}
    </div>
  )
}
