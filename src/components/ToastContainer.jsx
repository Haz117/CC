import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const cfg = {
  success: {
    Icon: CheckCircle2,
    bar: '#059669',
    iconBg: 'rgba(5,150,105,.1)',
    wash: 'rgba(5,150,105,.04)',
    iconColor: '#059669',
  },
  error: {
    Icon: XCircle,
    bar: '#C97A6D',
    iconBg: 'rgba(201,122,109,.12)',
    wash: 'rgba(201,122,109,.04)',
    iconColor: '#C97A6D',
  },
  warning: {
    Icon: AlertTriangle,
    bar: '#d97706',
    iconBg: 'rgba(217,119,6,.1)',
    wash: 'rgba(217,119,6,.04)',
    iconColor: '#d97706',
  },
  info: {
    Icon: Info,
    bar: '#2F8CEB',
    iconBg: '#EBF5FF',
    wash: 'rgba(47,140,235,.04)',
    iconColor: '#2F8CEB',
  },
}

function ToastItem({ toast, onRemove }) {
  const [phase, setPhase] = useState('enter') // 'enter' | 'alive' | 'exit'
  const c = cfg[toast.type] || cfg.info
  const { Icon } = c

  useEffect(() => {
    const t1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('alive'))
    })
    const t2 = setTimeout(() => {
      setPhase('exit')
      setTimeout(() => onRemove(toast.id), 340)
    }, 3800)
    return () => { cancelAnimationFrame(t1); clearTimeout(t2) }
  }, [toast.id, onRemove])

  const dismiss = () => {
    setPhase('exit')
    setTimeout(() => onRemove(toast.id), 340)
  }

  const style = {
    enter: { opacity: 0, transform: 'translateX(32px) scale(.95)' },
    alive: { opacity: 1, transform: 'translateX(0) scale(1)' },
    exit:  { opacity: 0, transform: 'translateX(24px) scale(.97)' },
  }[phase]

  return (
    <div
      style={{
        ...style,
        transition: 'opacity .32s cubic-bezier(.16,1,.3,1), transform .32s cubic-bezier(.16,1,.3,1)',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(38,52,66,.14), 0 2px 8px rgba(38,52,66,.06)',
        border: '1px solid #E2EAF2',
        borderTop: `2.5px solid ${c.bar}`,
        padding: '14px 14px 14px 16px',
        width: '360px',
        overflow: 'hidden',
      }}
    >
      {/* Left color accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: c.bar,
        borderRadius: '16px 0 0 16px',
      }} />

      {/* Background wash */}
      <div style={{
        position: 'absolute', inset: 0, background: c.wash, pointerEvents: 'none', borderRadius: '16px',
      }} />

      {/* Icon */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: c.iconBg,
        position: 'relative', zIndex: 1,
      }}>
        <Icon style={{ width: '18px', height: '18px', color: c.iconColor }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1, paddingTop: '2px' }}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, color: '#263442', lineHeight: 1.3, margin: 0 }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ fontSize: '.75rem', color: '#8FA1B2', marginTop: '3px', lineHeight: 1.5 }}>
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action.fn(); dismiss() }}
            style={{
              fontSize: '.72rem', fontWeight: 800, marginTop: '6px', display: 'inline-block',
              color: c.bar, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              letterSpacing: '.01em', fontFamily: 'inherit',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
          >
            {toast.action.label} →
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        style={{
          flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#D4DDE6', background: 'transparent', border: 'none', cursor: 'pointer',
          transition: 'background .15s, color .15s', position: 'relative', zIndex: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#F2F3F5'; e.currentTarget.style.color = '#627080' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D4DDE6' }}
      >
        <X style={{ width: '13px', height: '13px' }} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, height: '3px',
          background: c.bar,
          animation: 'toast-progress 3.8s linear forwards',
          borderRadius: '0 0 0 16px',
        }}
      />
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = e => setToasts(prev => [...prev.slice(-4), e.detail])
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  const remove = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), [])

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: '10px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
