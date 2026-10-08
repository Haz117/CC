import { Milk, AlertCircle, CheckCircle2 } from 'lucide-react'

// Marco de las pantallas sin sesión: inicio de sesión, recuperar y nueva contraseña.
export default function PantallaAcceso({ titulo, subtitulo, error, exito, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Barra naranja arriba */}
      <div style={{ height: 4, background: 'linear-gradient(to right,#C2410C,#F97316,#FB923C)', flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 32px 40px', maxWidth: 420, width: '100%', margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF7ED', border: '1.5px solid #FDE8D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Milk style={{ width: 22, height: 22, color: '#F97316' }} />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, color: '#111', lineHeight: 1.2 }}>Cremerías Admin</p>
            <p style={{ fontSize: 12, color: '#627080', marginTop: 3 }}>Sistema de Punto de Venta</p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-.04em', color: '#111', lineHeight: 1, marginBottom: 10 }}>
            {titulo}
          </h1>
          <p style={{ fontSize: 14, color: '#627080', lineHeight: 1.6 }}>{subtitulo}</p>
        </div>

        {error && (
          <div role="alert" className="animate-shake" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, padding: '13px 16px', borderRadius: 12, marginBottom: 32, background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.22)', color: '#A05A52' }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
            {error}
          </div>
        )}

        {exito && (
          <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, padding: '13px 16px', borderRadius: 12, marginBottom: 32, background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.22)', color: '#059669' }}>
            <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
            {exito}
          </div>
        )}

        {children}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#627080', padding: '0 0 28px' }}>
        © 2026 Cremerías Admin · Acceso seguro SSL
      </p>
    </div>
  )
}
