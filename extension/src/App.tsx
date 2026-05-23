import { Component } from "react"
import type { ReactNode } from "react"
import { Popup } from "./components/popup"

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', fontFamily: 'sans-serif', fontSize: '13px', width: '288px' }}>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>Something went wrong</p>
          <p style={{ color: '#5f6368', marginBottom: '12px', fontSize: '12px' }}>
            {(this.state.error as Error).message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ fontSize: '12px', padding: '4px 10px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>
  )
}

export default App
