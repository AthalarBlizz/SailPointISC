import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Curriculum app error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 560 }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.clear()
              } catch {
                /* ignore */
              }
              window.location.reload()
            }}
          >
            Clear data and reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
