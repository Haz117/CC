import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'rgba(201,122,109,.1)' }}>
        <AlertCircle className="w-10 h-10" style={{ color: '#C97A6D' }} />
      </div>
      <p className="text-6xl font-black mb-2" style={{ color: '#263442' }}>404</p>
      <p className="text-base font-semibold mb-1" style={{ color: '#263442' }}>Página no encontrada</p>
      <p className="text-sm mb-8" style={{ color: '#8FA1B2' }}>La ruta que buscas no existe en este sistema.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Ir al Dashboard
      </button>
    </div>
  )
}
