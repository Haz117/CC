import { useState, useEffect } from 'react'
import { Smartphone, X } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-install-dismissed') === '1') return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setTimeout(() => setVisible(true), 4000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !prompt) return null

  const install = async () => {
    setVisible(false)
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  return (
    <div
      className="fixed z-30 animate-fade-in-up lg:max-w-xs lg:left-auto"
      style={{
        bottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
        left: 12, right: 12,
        background: '#fff',
        border: '1px solid #FDE8D0',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(194,65,12,.18)',
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: '#FFF7ED', border: '1px solid #FDBA74',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Smartphone size={19} style={{ color: '#F97316' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#263442', lineHeight: 1.3 }}>
            Instalar Cremerías Admin
          </p>
          <p style={{ fontSize: 11, color: '#8FA1B2', marginTop: 2, lineHeight: 1.5 }}>
            Agrega la app a tu pantalla de inicio para acceso rápido
          </p>
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#8FA1B2', flexShrink: 0 }}
          aria-label="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={install} className="btn-primary" style={{ flex: 1, padding: '9px 16px', fontSize: '.8125rem', borderRadius: 10 }}>
          Instalar
        </button>
        <button onClick={dismiss} className="btn-ghost" style={{ padding: '9px 14px', fontSize: '.8125rem', borderRadius: 10 }}>
          Después
        </button>
      </div>
    </div>
  )
}
