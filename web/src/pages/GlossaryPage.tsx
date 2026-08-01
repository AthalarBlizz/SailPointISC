import { glossary } from '../content'

export function GlossaryPage() {
  return (
    <div>
      <header className="page-header">
        <span className="eyebrow">Quick reference</span>
        <h1>Conversational glossary</h1>
        <p className="muted">Phrases you’ll hear in ISC developer conversations.</p>
      </header>
      <div className="stack">
        {glossary.map((g) => (
          <article key={g.term} className="card">
            <h3 style={{ margin: 0 }}>{g.term}</h3>
            <p style={{ marginTop: '0.35rem' }}>{g.meaning}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
