import { Milk, AlertCircle, CheckCircle2 } from 'lucide-react'

// Marco de las pantallas sin sesión: inicio de sesión, recuperar y nueva contraseña.
// Dos columnas en escritorio (marca + formulario); en móvil solo el formulario.
export default function PantallaAcceso({ titulo, subtitulo, error, exito, children }) {
  return (
    <div className="acceso">

      {/* ── Panel de marca (solo escritorio) ── */}
      <aside className="acceso-marca">
        <div className="acceso-marca-centro">
          <div className="acceso-marca-logo"><Milk aria-hidden="true" strokeWidth={1.9} /></div>
          <p className="acceso-marca-nombre">Cremerías</p>
          <p className="acceso-marca-rol">Administración de sucursales, cajas e inventario</p>
        </div>

        <p className="acceso-marca-pie">© 2026 Cremerías</p>
      </aside>

      {/* ── Formulario ── */}
      <main className="acceso-form">
        <div className="acceso-barra-movil" />
        <div className="acceso-form-inner">

          {/* Logo: solo visible cuando el panel de marca está oculto (móvil) */}
          <div className="acceso-logo-movil">
            <div className="acceso-logo-chip acceso-logo-chip-claro"><Milk style={{ width: 22, height: 22, color: '#C2410C' }} /></div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#111', lineHeight: 1.2 }}>Cremerías Admin</p>
              <p style={{ fontSize: 12, color: '#627080', marginTop: 3 }}>Administración</p>
            </div>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-.02em', color: '#111', lineHeight: 1, marginBottom: 10 }}>{titulo}</h1>
            <p style={{ fontSize: 14, color: '#627080', lineHeight: 1.6 }}>{subtitulo}</p>
          </div>

          {error && (
            <div role="alert" className="animate-shake" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, padding: '13px 16px', borderRadius: 12, marginBottom: 28, background: 'rgba(201,122,109,.08)', border: '1px solid rgba(201,122,109,.22)', color: '#8A4A42' }}>
              <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
              {error}
            </div>
          )}

          {exito && (
            <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, padding: '13px 16px', borderRadius: 12, marginBottom: 28, background: 'rgba(5,150,105,.08)', border: '1px solid rgba(5,150,105,.22)', color: '#047857' }}>
              <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
              {exito}
            </div>
          )}

          {children}
        </div>

        <p className="acceso-pie-movil">© 2026 Cremerías</p>
      </main>
    </div>
  )
}
