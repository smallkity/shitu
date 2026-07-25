import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
  stack?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? String(error), stack: error?.stack }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[拾图] 渲染崩溃:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 13, color: '#995238', background: '#fbfaf8', minHeight: '100vh' }}>
          <h2 style={{ marginBottom: 12 }}>⚠ 拾图遇到渲染错误</h2>
          <p style={{ marginBottom: 16, color: '#666' }}>请复制下方信息发给开发者，然后刷新页面重试。</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f5f2ed', padding: 16, borderRadius: 8 }}>
            {this.state.message}
            {'\n\n'}
            {this.state.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 20px', background: '#bd704e', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer' }}
          >
            刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
