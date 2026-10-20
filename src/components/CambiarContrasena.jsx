import { useState } from 'react'
import Modal from './Modal'
import ModalFooter from './ModalFooter'
import FormField from './FormField'
import { useAuth } from '../auth/contexto'
import { validarContrasena } from '../utils/validar'
import toast from '../utils/toast'

export default function CambiarContrasena({ onClose }) {
  const { cambiarContrasena, modoDemo } = useAuth()
  const [nueva,     setNueva]     = useState('')
  const [repetida,  setRepetida]  = useState('')
  const [error,     setError]     = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    const invalida = validarContrasena(nueva, repetida)
    if (invalida) { setError(invalida); return }
    if (modoDemo) {
      toast.info('Modo demostración', 'Aquí la contraseña no se cambia')
      onClose()
      return
    }
    setGuardando(true)
    try {
      await cambiarContrasena(nueva)
      toast.success('Contraseña actualizada', 'Úsala la próxima vez que inicies sesión')
      onClose()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal title="Cambiar contraseña" subtitle="Mínimo 8 caracteres" maxWidth="sm" onClose={onClose}>
      <div className="p-6 space-y-4">
        <FormField label="Nueva contraseña" required>
          <input type="password" autoFocus autoComplete="new-password" className="input-field"
            value={nueva} onChange={e => { setNueva(e.target.value); setError('') }} />
        </FormField>
        <FormField label="Repite la contraseña" required error={error}>
          <input type="password" autoComplete="new-password" className={`input-field ${error ? 'input-field-error' : ''}`}
            value={repetida} onChange={e => { setRepetida(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') guardar() }} />
        </FormField>
      </div>
      <ModalFooter onCancel={onClose} onConfirm={guardar} disabled={guardando} confirmLabel={guardando ? 'Guardando…' : 'Cambiar contraseña'} />
    </Modal>
  )
}
