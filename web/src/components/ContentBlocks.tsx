import type { ContentBlock } from '../content/types'
import { annotateGlossary } from '../lib/glossaryTerms'
import { MermaidDiagram } from './MermaidDiagram'
import { QuizBlock } from './QuizBlock'

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="stack">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return <p key={i}>{annotateGlossary(block.text, `p${i}`)}</p>
          case 'list':
            return block.ordered ? (
              <ol key={i} className="block-list">
                {block.items.map((item, ji) => (
                  <li key={`${i}-${ji}`}>{annotateGlossary(item, `ol${i}-${ji}`)}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="block-list">
                {block.items.map((item, ji) => (
                  <li key={`${i}-${ji}`}>{annotateGlossary(item, `ul${i}-${ji}`)}</li>
                ))}
              </ul>
            )
          case 'table':
            return (
              <div key={i} className="content-table">
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((h, hi) => (
                        <th key={hi}>{annotateGlossary(h, `th${i}-${hi}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{annotateGlossary(cell, `td${i}-${ri}-${ci}`)}</td>
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
                {block.title ? (
                  <strong>{annotateGlossary(block.title, `ct${i}`)}</strong>
                ) : null}
                <span>{annotateGlossary(block.text, `c${i}`)}</span>
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
          case 'diagram':
            return (
              <MermaidDiagram
                key={i}
                mermaid={block.mermaid}
                title={block.title}
                caption={block.caption}
              />
            )
          case 'quiz':
            return (
              <QuizBlock
                key={block.id}
                id={block.id}
                prompt={block.prompt}
                choices={block.choices}
                correctId={block.correctId}
                explanation={block.explanation}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
