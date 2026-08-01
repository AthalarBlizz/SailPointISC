import { snapshotRows, authoritativeLinks, currencyDate } from '../content'

export function SnapshotPage() {
  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">Memorize this · {currencyDate}</span>
        <h1>Platform snapshot</h1>
        <p className="muted">
          What separates a 2025-era answer from a current one. Tap through the “say this” column
          until you can recite it.
        </p>
      </header>

      <div className="content-table card" style={{ padding: '0.5rem' }}>
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Current state</th>
              <th>What you must be able to say</th>
            </tr>
          </thead>
          <tbody>
            {snapshotRows.map((row) => (
              <tr key={row.topic}>
                <td>
                  <strong>{row.topic}</strong>
                </td>
                <td>{row.current}</td>
                <td>{row.sayThis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="section">
        <h2>Authoritative sources</h2>
        <ul className="block-list">
          {authoritativeLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
