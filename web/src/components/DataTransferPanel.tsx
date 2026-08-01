import { useRef, useState } from 'react'
import { useProgress } from '../hooks/useProgress'

type Props = {
  /** Compact strip for the path chooser; full card for home/tracker. */
  compact?: boolean
}

/**
 * Export / import progress so learners can move between phone, laptop, and browsers
 * via a JSON file (Files app, iCloud Drive, email, etc.).
 */
export function DataTransferPanel({ compact = false }: Props) {
  const { exportProgress, importProgress } = useProgress()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onExport = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const mode = await exportProgress()
      setStatus(
        mode === 'shared'
          ? 'Share sheet opened — save the file to iCloud Drive or Files.'
          : 'Download started — save the .json file somewhere you can open on another device.',
      )
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus(null)
      } else {
        setStatus('Export failed. Try again, or copy from browser downloads.')
      }
    } finally {
      setBusy(false)
    }
  }

  const onPickFile = () => inputRef.current?.click()

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setStatus(null)
    try {
      const text = await file.text()
      const error = importProgress(text)
      if (error) {
        setStatus(error)
      } else {
        setStatus('Progress imported. You can continue where you left off.')
      }
    } catch {
      setStatus('Could not read that file.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const body = (
    <>
      <p className={compact ? 'muted' : undefined} style={compact ? { margin: '0 0 0.75rem' } : undefined}>
        {compact
          ? 'Moving devices? Export a backup JSON, save it to iCloud/Files, then import here.'
          : 'Practice on your phone, export a JSON backup to iCloud Drive or Files, then import it in any other browser to resume.'}
      </p>
      <div className="actions">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={onExport}>
          Export progress
        </button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={onPickFile}>
          Import progress
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {status ? (
        <p className="muted" role="status" style={{ marginTop: '0.75rem' }}>
          {status}
        </p>
      ) : null}
    </>
  )

  if (compact) {
    return (
      <section className="section" style={{ marginTop: '1.75rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Backup & restore</h2>
        {body}
      </section>
    )
  }

  return (
    <section className="card section">
      <h2 style={{ marginTop: 0 }}>Backup & restore</h2>
      {body}
    </section>
  )
}
