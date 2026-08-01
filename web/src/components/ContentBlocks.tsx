import type { ContentBlock } from '../content/types'
import { MermaidDiagram } from './MermaidDiagram'
import { QuizBlock } from './QuizBlock'
import type { ReactNode } from 'react'

const URL_RE = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g

function linkify(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  const re = new RegExp(URL_RE.source, 'g')
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const href = match[0]
    parts.push(
      <a key={`${match.index}-${href}`} href={href} target="_blank" rel="noreferrer">
        {href}
      </a>,
    )
    last = match.index + href.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : [text]
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
                  <li key={item}>{linkify(item)}</li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="block-list">
                {block.items.map((item) => (
                  <li key={item}>{linkify(item)}</li>
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
                          <td key={ci}>{linkify(cell)}</td>
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
                <span>{linkify(block.text)}</span>
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
