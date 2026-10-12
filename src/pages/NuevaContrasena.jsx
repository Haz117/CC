import { useState } from 'react'
import { Lock, Loader2, ArrowRight } from 'lucide-react'
import PantallaAcceso from '../components/PantallaAcceso'
import { useAuth } from '../auth/contexto'
import toast from '../utils/toast'
import { validarContrasena } from '../utils/validar'

const etiqueta   = { display: 'block', fontSize: 12, fontWeight: 700, color: '#627080', letterSpacing: '.02em', marginBottom: 10 }
const iconoCampo = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#FB923C', pointerEvents: 'none' }

// A esta pantalla se llega desde el enlace del correo de recuperación.
export default function NuevaContrasena() {
  const { cambiarContrasena, cerrarSesion } = useAuth()
  const [nueva,    setNueva]    = useState('')
  const [repetida, setRepetida] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const invalida = validarContrasena(nueva, repetida)
    if (invalida) { setError(invalida); return }
    setLoading(true)
    try {
      await cambiarContrasena(nueva)
      toast.success('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const campo = (id, texto, valor, cambiar, foco) => (
    <div style={{ marginBottom: 24 }}>
      <label htmlFor={id} style={etiqueta}>{texto}</label>
      <div style={{ position: 'relative' }}>
        <Lock style={iconoCampo} />
        <input
          id={id}
          type="password"
          value={valor}
          onChange={e => { cambiar(e.target.value); setError('') }}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          autoFocus={foco}
          className="input-field"
          style={{ paddingLeft: 44, paddingTop: 15, paddingBottom: 15, fontSize: 14 }}
        />
      </div>
    </div>
  )

  return (
    <PantallaAcceso titulo="Nueva contraseña" subtitulo="Elige la contraseña con la que entrarás a partir de ahora" error={error}>
      <form onSubmit={handleSubmit} aria-label="Elegir nueva contraseña">
        {campo('nueva-contrasena', 'Nueva contraseña', nueva, setNueva, true)}
        {campo('repetir-contrasena', 'Repite la contraseña', repetida, setRepetida, false)}
        <button type="submit" disabled={loading} className="btn-primary w-full" style={{ padding: '16px 24px', fontSize: 15, borderRadius: 14, marginTop: 8 }}>
          {loading
            ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Guardando...</>
            : <>Guardar contraseña <ArrowRight style={{ width: 16, height: 16 }} /></>
          }
        </button>
      </form>
      <button type="button" onClick={cerrarSesion}
        style={{ fontSize: 12, fontWeight: 600, color: '#627080', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 28, padding: 0, textAlign: 'left' }}>
        Cancelar y cerrar sesión
      </button>
    </PantallaAcceso>
  )
}
