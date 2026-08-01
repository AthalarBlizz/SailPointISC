import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { phases } from '../content'
import { useProgress } from '../hooks/useProgress'

const bottomLinks = [
  { to: '/', label: 'Home', ico: '⌂' },
  { to: '/snapshot', label: 'Snapshot', ico: '⧉' },
  { to: '/drills', label: 'Drills', ico: '✎' },
  { to: '/labs', label: 'Labs', ico: '⬡' },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { setLastRoute } = useProgress()

  useEffect(() => {
    setMenuOpen(false)
    setLastRoute(location.pathname + location.search + location.hash)
  }, [location, setLastRoute])

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
            <span className="brand-sub">Conversational fluency · Jul 2026</span>
          </span>
        </NavLink>
        <button
          type="button"
          className="icon-btn menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

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

        <div className="nav-label">Phases</div>
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

        <div className="nav-label">Practice</div>
        <NavLink to="/drills" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Conversational drills
        </NavLink>
        <NavLink to="/labs" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Guided labs
        </NavLink>
      </nav>

      <main id="main" className="main">
        <Outlet />
      </main>

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
    </div>
  )
}
