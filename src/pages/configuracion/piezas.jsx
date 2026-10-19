/* ── Toggle switch ──────────────────────────────────────────── */
// El renglón que lo contiene también cambia el ajuste al tocarlo: sin detener el clic aquí,
// tocar el interruptor lo cambiaba dos veces y se quedaba igual.
export function Toggle({ on, onChange, etiqueta }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={etiqueta}
      onClick={e => { e.stopPropagation(); onChange() }}
      className="w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0"
      style={{ background: on ? '#C2410C' : '#D4DDE6', boxShadow: on ? '0 0 0 3px rgba(249,115,22,.15)' : 'none' }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
        style={{ left: on ? 'calc(100% - 20px)' : '4px', boxShadow: '0 1px 3px rgba(38,52,66,.12)' }}
      />
    </button>
  )
}

/* ── Setting row (label + toggle) ───────────────────────────── */
export function SettingRow({ label, sub, on, onChange }) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl cursor-pointer select-none transition-colors"
      style={{ background: on ? '#FFF7ED' : '#F2F3F5', border: `1px solid ${on ? '#FDBA74' : '#FDE8D0'}` }}
      onClick={onChange}
    >
      <div className="min-w-0 mr-4">
        <p className="text-sm font-semibold" style={{ color: '#263442' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#627080' }}>{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} etiqueta={label} />
    </div>
  )
}

/* ── Dato con etiqueta ──────────────────────────────────────── */
export function Dato({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F2F3F5' }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#627080' }} />
      <div className="min-w-0">
        <p className="text-xs font-semibold" style={{ color: '#627080' }}>{label}</p>
        <p className="text-sm font-semibold break-words" style={{ color: '#263442' }}>{children}</p>
      </div>
    </div>
  )
}
