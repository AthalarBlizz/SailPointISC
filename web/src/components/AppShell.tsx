import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { phases, tracks, implementationModules } from '../content'
import { useProgress } from '../hooks/useProgress'
import type { LearningPathId } from '../lib/storage'

const bottomLinks = [
  { to: '/', label: 'Home', ico: '⌂' },
  { to: '/snapshot', label: 'Snapshot', ico: '⧉' },
  { to: '/drills', label: 'Drills', ico: '✎' },
  { to: '/labs', label: 'Labs', ico: '⬡' },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { rememberRoute, activePath, setActivePath, pathChosen } = useProgress()

  useEffect(() => {
    setMenuOpen(false)
    // Persist outside React state to avoid render loops.
    rememberRoute(location.pathname + location.search)
  }, [location.pathname, location.search, rememberRoute])

  const switchPath = (path: LearningPathId) => {
    setActivePath(path)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">ISC</span>
          <span className="brand-text">
            <span className="brand-title">Developer Curriculum</span>
            <span className="brand-sub">
              {!pathChosen
                ? 'Choose a path'
                : activePath === 'fluency'
                  ? 'Path A · Fluency'
                  : 'Path B · Implementation'}{' '}
              · Jul 2026
            </span>
          </span>
        </NavLink>
        <div className="topbar-actions">
          {pathChosen ? (
            <div className="path-switch" role="group" aria-label="Learning path">
              <button
                type="button"
                className={activePath === 'fluency' ? 'active' : undefined}
                onClick={() => switchPath('fluency')}
              >
                Fluency
              </button>
              <button
                type="button"
                className={activePath === 'implementation' ? 'active' : undefined}
                onClick={() => switchPath('implementation')}
              >
                Implement
              </button>
            </div>
          ) : null}
          {pathChosen ? (
            <button
              type="button"
              className="icon-btn menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          ) : null}
        </div>
      </header>

      {pathChosen ? (
        <nav className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="Primary">
          <div className="nav-label">Learn</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink
            to="/snapshot"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Platform snapshot
          </NavLink>
          <NavLink
            to="/glossary"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Glossary
          </NavLink>
          <NavLink
            to="/tracker"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Progress tracker
          </NavLink>

          {activePath === 'fluency' ? (
            <>
              <div className="nav-label">Path A · Phases</div>
              {phases.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/phase/${p.id}`}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span className="num">{p.number}</span>
                  {p.shortTitle}
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <div className="nav-label">Path B · Tracks</div>
              {tracks.map((t) => (
                <details key={t.id} className="nav-track track-group" open>
                  <summary>{t.shortTitle}</summary>
                  {t.moduleIds.map((mid) => {
                    const mod = implementationModules.find((m) => m.id === mid)
                    if (!mod) return null
                    return (
                      <NavLink
                        key={mid}
                        to={`/module/${mid}`}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                      >
                        <span className="num">M{mod.number}</span>
                        {mod.shortTitle}
                      </NavLink>
                    )
                  })}
                </details>
              ))}
            </>
          )}

          <div className="nav-label">Practice</div>
          <NavLink
            to="/drills"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Drills
          </NavLink>
          <NavLink to="/labs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Labs
          </NavLink>
        </nav>
      ) : null}

      <main id="main" className={`main${!pathChosen ? ' main-solo' : ''}`}>
        <Outlet />
      </main>

      {pathChosen ? (
        <nav className="bottom-nav" aria-label="Mobile">
          {bottomLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <span className="ico" aria-hidden>
                {l.ico}
              </span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
