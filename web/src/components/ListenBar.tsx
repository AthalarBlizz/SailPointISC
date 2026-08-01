import { useEffect, useRef } from 'react'
import type { NarrationUtterance } from '../lib/narration'
import { useSpeechPlayer } from '../hooks/useSpeechPlayer'

type Props = {
  utterances: NarrationUtterance[]
  sectionTitles?: Record<string, string>
  onSectionChange?: (sectionId: string | undefined) => void
  onClose: () => void
}

export function ListenBar({ utterances, sectionTitles, onSectionChange, onClose }: Props) {
  const player = useSpeechPlayer(utterances)
  const startedRef = useRef(false)

  useEffect(() => {
    onSectionChange?.(player.current?.sectionId)
  }, [player.current?.sectionId, onSectionChange])

  useEffect(() => {
    if (startedRef.current) return
    if (!player.supported || utterances.length === 0) return
    startedRef.current = true
    // User clicked Listen — that gesture unlocks speechSynthesis.
    player.play()
  }, [player, utterances.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        if (player.status === 'playing') player.pause()
        else player.play()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [player])

  if (!player.supported) {
    return (
      <div className="listen-bar" role="status">
        <p className="muted" style={{ margin: 0 }}>
          Voice not supported in this browser.
        </p>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }

  const sectionLabel =
    player.current?.sectionId && sectionTitles?.[player.current.sectionId]
      ? sectionTitles[player.current.sectionId]
      : player.current?.kind === 'intro'
        ? 'Introduction'
        : player.current?.kind === 'outro'
          ? 'Wrap-up'
          : 'Listening'

  const playing = player.status === 'playing'
  const waiting = player.status === 'waiting'

  return (
    <div className="listen-bar" role="region" aria-label="Listen mode">
      <div className="listen-meta">
        <strong>{sectionLabel}</strong>
        <span className="muted">{player.progressLabel}</span>
        {waiting ? <span className="chip">Paused for micro-check — Next to continue</span> : null}
      </div>
      <div className="listen-controls">
        <button type="button" className="btn btn-ghost" onClick={player.prev} aria-label="Previous">
          Prev
        </button>
        {playing ? (
          <button type="button" className="btn btn-primary" onClick={player.pause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={player.play}>
            {waiting ? 'Continue' : player.status === 'paused' ? 'Resume' : 'Play'}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={player.next} aria-label="Next">
          Next
        </button>
        <button type="button" className="btn btn-ghost" onClick={player.stop}>
          Stop
        </button>
        <label className="listen-rate muted">
          Rate
          <select
            className="lab-input"
            style={{ width: 'auto', minHeight: 36, padding: '0.35rem 0.5rem' }}
            value={String(player.rate)}
            onChange={(e) => player.setRate(Number(e.target.value))}
          >
            <option value="0.85">0.85×</option>
            <option value="1">1×</option>
            <option value="1.25">1.25×</option>
          </select>
        </label>
        {player.voices.length > 0 ? (
          <label className="listen-rate muted">
            Voice
            <select
              className="lab-input"
              style={{ width: 'auto', maxWidth: '10rem', minHeight: 36, padding: '0.35rem 0.5rem' }}
              value={player.voiceUri}
              onChange={(e) => player.setVoiceUri(e.target.value)}
            >
              <option value="">Auto</option>
              {player.voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="listen-tip muted">
        Keep this tab open while listening — some browsers pause speech when the tab is fully
        backgrounded. Space toggles play/pause.
      </p>
    </div>
  )
}
