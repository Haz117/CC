import { useState, useEffect, useRef } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [showOnline, setShowOnline] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      setShowOnline(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setShowOnline(false), 3000)
    }
    const handleOffline = () => {
      setOnline(false)
      setShowOnline(false)
      clearTimeout(timer.current)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(timer.current)
    }
  }, [])

  if (online && !showOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2"
      style={{
        background: online ? '#059669' : '#C97A6D',
        color: '#fff',
        paddingTop: 'max(10px, env(safe-area-inset-top))',
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 12,
        fontWeight: 600,
        animation: 'fadeInDown .28s ease-out both',
        textAlign: 'center',
      }}
    >
      {online
        ? <><Wifi size={13} /> Conexión restablecida</>
        : <><WifiOff size={13} /> Sin conexión · mostrando datos guardados</>
      }
    </div>
  )
}
