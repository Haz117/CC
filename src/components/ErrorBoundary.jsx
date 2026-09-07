import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,122,109,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24, color: '#C97A6D' }}>!</span>
          </div>
          <p style={{ color: '#263442', fontWeight: 700, fontSize: '1rem' }}>Error al cargar la página</p>
          <p style={{ color: '#8FA1B2', fontSize: '.875rem' }}>Verifica tu conexión e intenta de nuevo</p>
          <button className="btn-primary" onClick={() => this.setState({ hasError: false })}>
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
