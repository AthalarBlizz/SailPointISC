import { useState } from 'react'
import { useProgress } from '../hooks/useProgress'

type QuizProps = {
  id: string
  prompt: string
  choices: { id: string; label: string }[]
  correctId: string
  explanation: string
}

export function QuizBlock({ id, prompt, choices, correctId, explanation }: QuizProps) {
  const { progress, markQuizCorrect } = useProgress()
  const already = progress.sectionChecks.includes(id)
  const [selected, setSelected] = useState<string | null>(already ? correctId : null)
  const [checked, setChecked] = useState(already)

  const isCorrect = selected === correctId

  return (
    <div className={`quiz-block${already ? ' quiz-passed' : ''}`}>
      <div className="eyebrow">Micro-check</div>
      <p className="quiz-prompt">{prompt}</p>
      <div className="quiz-choices" role="radiogroup" aria-label="Quiz choices">
        {choices.map((c) => {
          const chosen = selected === c.id
          let cls = 'quiz-choice'
          if (checked && chosen && isCorrect) cls += ' correct'
          if (checked && chosen && !isCorrect) cls += ' wrong'
          if (checked && c.id === correctId && !isCorrect) cls += ' reveal'
          return (
            <button
              key={c.id}
              type="button"
              className={cls}
              disabled={already || checked}
              onClick={() => setSelected(c.id)}
              aria-pressed={chosen}
            >
              {c.label}
            </button>
          )
        })}
      </div>
      {!already && !checked ? (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected}
          onClick={() => {
            setChecked(true)
            if (selected === correctId) markQuizCorrect(id)
          }}
        >
          Check
        </button>
      ) : null}
      {checked || already ? (
        <div className={`quiz-feedback ${isCorrect || already ? 'ok' : 'bad'}`}>
          {already || isCorrect ? (
            <strong>Correct.</strong>
          ) : (
            <strong>Not quite.</strong>
          )}{' '}
          {explanation}
          {!already && !isCorrect ? (
            <div className="actions" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setChecked(false)
                  setSelected(null)
                }}
              >
                Try again
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
