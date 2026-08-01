import type { ContentBlock } from '../content/types'

function linkify(text: string) {
  return text
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="stack">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{linkify(block.text)}</p>
          case 'list':
            return block.ordered ? (
              <ol key={i} className="block-list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="block-list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'table':
            return (
              <div key={i} className="content-table">
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'code':
            return (
              <div key={i} className="block-code">
                <pre>
                  <code>{block.code}</code>
                </pre>
              </div>
            )
          case 'callout':
            return (
              <div key={i} className={`callout ${block.tone ?? 'info'}`}>
                {block.title ? <strong>{block.title}</strong> : null}
                <span>{block.text}</span>
              </div>
            )
          case 'links':
            return (
              <ul key={i} className="block-list">
                {block.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
