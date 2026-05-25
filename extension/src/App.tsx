import { Component } from "react"
import type { ReactNode } from "react"
import { ClerkProvider, useUser, useAuth } from "@clerk/chrome-extension"
import { Popup } from "./components/popup"
import type { AuthProps } from "./components/popup"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const NO_AUTH: AuthProps = { isSignedIn: false, user: null, getToken: () => Promise.resolve(null) }

function PopupWithAuth() {
  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()
  return <Popup auth={{ isSignedIn: !!isSignedIn, user: user ?? null, getToken }} />
}

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
  if (!PUBLISHABLE_KEY) {
    return (
      <ErrorBoundary>
        <Popup auth={NO_AUTH} />
      </ErrorBoundary>
    )
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} syncHost="https://replie.email">
      <ErrorBoundary>
        <PopupWithAuth />
      </ErrorBoundary>
    </ClerkProvider>
  )
}

export default App
