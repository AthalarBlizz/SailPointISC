import { useEffect } from 'react'
import { useProgress } from '../hooks/useProgress'

export function ToastHost() {
  const { toasts, dismissToast } = useProgress()

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismissToast(t.id), 3200),
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, dismissToast])

  if (toasts.length === 0) return null

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`toast toast-${t.kind}`}
          onClick={() => dismissToast(t.id)}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
