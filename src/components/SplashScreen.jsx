import { useEffect, useState } from 'react'
import { Milk } from 'lucide-react'

export default function SplashScreen({ onDone }) {
  const [ready,   setReady]   = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setReady(true),   80)
    const t2 = setTimeout(() => setLeaving(true), 1950)
    const t3 = setTimeout(() => onDone(),         2340)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [onDone])

  return (
    <div className={`splash-screen${leaving ? ' splash-exit' : ''}`}>

      {/* Pulsing rings */}
      <div className="splash-rings">
        <div className="splash-ring splash-ring-sm" />
        <div className="splash-ring splash-ring-md" />
        <div className="splash-ring splash-ring-lg" />
      </div>

      {/* Dot grid */}
      <div className="hero-dots absolute inset-0 opacity-[0.08] pointer-events-none" />

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center gap-5">

        {/* Logo icon */}
        <div className={`splash-logo${ready ? ' splash-logo-in' : ''}`}>
          <Milk className="w-11 h-11 text-white" />
        </div>

        {/* Brand name */}
        <div className={`text-center splash-brand${ready ? ' splash-brand-in' : ''}`}>
          <p className="text-white font-black text-[1.6rem] tracking-tight leading-none">
            Cremerías Admin
          </p>
          <p className="text-sm font-medium mt-2" style={{ color: 'rgba(255,220,170,.75)' }}>
            Sistema de Punto de Venta
          </p>
        </div>

        {/* Progress bar */}
        <div className="splash-bar">
          <div className={`splash-bar-fill${ready ? ' splash-bar-animate' : ''}`} />
        </div>

        {/* Version */}
        <p
          className={`text-white/25 text-[11px] font-semibold tracking-wide splash-brand${ready ? ' splash-brand-in' : ''}`}
          style={{ animationDelay: '.55s' }}
        >
          v2.4 · 2026
        </p>
      </div>
    </div>
  )
}
