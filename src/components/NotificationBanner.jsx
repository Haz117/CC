import { useState, useEffect } from 'react'
import { Bell, X, BellOff } from 'lucide-react'
import notify from '../utils/notifications'

export default function NotificationBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  const enable = async () => {
    const granted = await notify.requestPermission()
    setShow(false)
    if (granted) {
      notify.send('🔔 Notificaciones activadas', {
        body: 'Recibirás alertas de inventario, ventas y rutas en tiempo real.',
      })
    }
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-md animate-fade-in-up">
      <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ border: '1px solid #FDE8D0', boxShadow: '0 20px 60px rgba(194,65,12,.18), 0 4px 16px rgba(0,0,0,.08)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFF7ED' }}>
          <Bell className="w-5 h-5" style={{ color: '#F97316' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#263442' }}>Activar notificaciones</p>
          <p className="text-xs mt-0.5" style={{ color: '#8FA1B2' }}>Recibe alertas de stock, rutas y ventas</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={enable}
            className="btn-primary text-xs px-3 py-2"
            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
          >
            Activar
          </button>
          <button
            onClick={() => setShow(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#8FA1B2' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#627080'; e.currentTarget.style.background = '#F2F3F5' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8FA1B2'; e.currentTarget.style.background = 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
