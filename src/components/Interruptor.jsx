// Interruptor con su texto al lado, para filtros de sí/no ("Solo bajo mínimo").
export default function Interruptor({ activo, onChange, children }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => onChange(!activo)} className="interruptor">
      <span className="interruptor-riel" aria-hidden="true"><span className="interruptor-bola" /></span>
      {children}
    </button>
  )
}
