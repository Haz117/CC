import { useNavigate } from 'react-router-dom'
import { useEnfocarTitulo } from '../hooks/useEnfocarTitulo'

export default function NotFound() {
  const navigate = useNavigate()
  const titulo = useEnfocarTitulo()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 ref={titulo} className="text-2xl font-bold mb-2" style={{ color: '#263442' }}>No encontramos esta página</h1>
      <p className="text-sm mb-8 max-w-sm" style={{ color: '#627080' }}>La dirección no existe o la pantalla ya no está disponible. Revisa el menú o vuelve al panel.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary">Ir al panel</button>
    </div>
  )
}
