import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts'
import { Mail, Phone, MoreVertical, Clock } from 'lucide-react'
import { perfData, distribuidores, timeline, eventosProximos } from '../data/dashboard'

/* ═══════════════════════════════════════════════════════════════
   COLORES
═══════════════════════════════════════════════════════════════ */
const C = {
  blue:      '#F97316',
  blueLight: '#FFF7ED',
  blueRing:  '#FDE8D0',
  text:      '#263442',
  textSub:   '#8FA1B2',
  border:    '#FDE8D0',
  dot:       '#D4DDE6',
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTES PUROS
═══════════════════════════════════════════════════════════════ */

/* Etiqueta encima de cada barra */
function BarLbl(props) {
  const { x, y, width, value } = props
  return (
    <text x={x + width / 2} y={y - 4}
      textAnchor="middle"
      style={{ fontSize: 9.5, fontWeight: 700, fill: C.textSub, fontFamily: 'Inter,sans-serif' }}>
      {value}
    </text>
  )
}

/* Tooltip del gráfico de barras — con indicador de tendencia */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const pct = payload[0].value
  let arrow, arrowColor
  if (pct >= 80) {
    arrow = '↑'
    arrowColor = '#059669'
  } else if (pct < 70) {
    arrow = '↓'
    arrowColor = '#C97A6D'
  } else {
    arrow = '—'
    arrowColor = '#d97706'
  }
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '7px 12px',
      boxShadow: '0 4px 16px rgba(249,115,22,.12)',
      border: `1px solid ${C.blueRing}`,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.textSub }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: C.blue }}>{pct}%</p>
        <span style={{ fontSize: 15, fontWeight: 800, color: arrowColor, lineHeight: 1 }}>{arrow}</span>
      </div>
    </div>
  )
}

/* Chip de período */
function PeriodChip({ value, onChange }) {
  return (
    <button
      onClick={() => {
        const opts = ['Agosto','Julio','Junio']
        const next = opts[(opts.indexOf(value) + 1) % opts.length]
        onChange(next)
      }}
      style={{
        fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8,
        border: `1.5px solid ${C.dot}`, background: '#fff',
        color: C.text, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      {value} ▾
    </button>
  )
}

/* Iniciales de nombre */
const ini = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate  = useNavigate()
  const [period, setPeriod] = useState('Agosto')

  const best = [...perfData].sort((a, b) => b.pct - a.pct)[0]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ═══════════════════════════════════════════════════════
          GRID PRINCIPAL: col-izq (flex:1)  +  col-der (280px)
      ══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid">

        {/* ─────────────── COLUMNA IZQUIERDA ─────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ━━━ 1. PERFORMANCE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="card p-5">
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Rendimiento</span>
              <PeriodChip value={period} onChange={setPeriod} />
            </div>

            {/* mejor sucursal */}
            <p style={{ fontSize: 11, color: C.textSub, fontWeight: 600, marginBottom: 4 }}>La mejor sucursal:</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: C.text, letterSpacing: '-.05em', lineHeight: 1 }}>
                {best.pct}
              </span>
              <span style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>
                {best.name} · mayor porcentaje
              </span>
              <button onClick={() => navigate('/sucursales')} style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '4px 14px',
                borderRadius: 99, border: `1.5px solid ${C.dot}`,
                background: '#fff', color: C.text, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Ver todas
              </button>
            </div>

            {/* gráfica */}
            <ResponsiveContainer width="100%" height={175}>
              <BarChart data={perfData} barCategoryGap="38%" margin={{ top: 18, left: -30, right: 4, bottom: 20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#F97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#C2410C" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 0" stroke="#FDE8D0" vertical={false} />
                <XAxis dataKey="name"
                  tick={{ fontSize: 9, fill: C.textSub, fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                  interval={0} angle={-30} textAnchor="end" height={36} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(249,115,22,.07)', radius: [6,6,0,0] }} />
                <Bar dataKey="pct" fill="url(#barGrad)" radius={[7, 7, 2, 2]}>
                  <LabelList content={<BarLbl />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ━━━ 2. DISTRIBUIDORES ━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Mis distribuidores</span>
              <button onClick={() => navigate('/distribuidores')} style={{
                fontSize: 12, fontWeight: 700, color: C.blue,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Ver todos
              </button>
            </div>

            {distribuidores.map((d, i) => (
              <div key={d.nombre}>
                {i > 0 && <div style={{ height: 1, background: C.border }} />}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 6px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.blueLight }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: d.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: d.color,
                  }}>
                    {ini(d.nombre)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 1 }}>{d.nombre}</p>
                    <p style={{ fontSize: 11, color: C.textSub }}>{d.rol}</p>
                  </div>
                  {[['mail', Mail], ['phone', Phone]].map(([label, Icon]) => (
                    <button key={label} style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: 'none', background: C.blueLight, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FDBA74' }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.blueLight }}
                    >
                      <Icon size={14} color={C.blue} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>{/* fin col izquierda */}

        {/* ─────────────── COLUMNA DERECHA (280px) ───────── */}
        <div className="dashboard-right">

          {/* ━━━ CALENDARIO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="card p-5">
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Agenda del día</p>
                <p style={{ fontSize: 10, color: C.textSub, marginTop: 2 }}>6 eventos hoy</p>
              </div>
              <button style={{
                fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                border: `1.5px solid ${C.dot}`, background: '#fff',
                color: C.text, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Hoy ▾
              </button>
            </div>

            {/* ── Timeline ──────────────────────────────── */}
            <div style={{ position: 'relative' }}>
              {timeline.map((item, idx) => {

                /* ── LÍNEA DIVISORA (current time) ── */
                if (item.type === 'divider') {
                  return (
                    <div key="tl-divider" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0', paddingLeft: 42 }}>
                      <div style={{ flex: 1, height: 0, borderTop: '2px dashed #FDBA74' }} />
                    </div>
                  )
                }

                /* ── SLOT VACÍO (solo hora + línea vertical) ── */
                if (item.type === 'empty') {
                  return (
                    <div key={'tl-empty-' + item.time} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', minHeight: 24 }}>
                      {/* hora */}
                      <div style={{ width: 34, flexShrink: 0, textAlign: 'right', paddingTop: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.textSub }}>{item.time}</span>
                      </div>
                      {/* línea vertical central */}
                      <div style={{ width: 14, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
                        <div style={{ width: 1, background: C.border, minHeight: 22 }} />
                      </div>
                    </div>
                  )
                }

                /* ── EVENTO ── */
                return (
                  <div key={'tl-' + item.time} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 2 }}>
                    {/* hora */}
                    <div style={{ width: 34, flexShrink: 0, textAlign: 'right', paddingTop: item.active ? 13 : 9 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: item.active ? C.blue : C.textSub }}>
                        {item.time}
                      </span>
                    </div>

                    {/* dot + conector vertical */}
                    <div style={{ width: 14, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {item.active ? (
                        <>
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 10,
                            background: C.blue, border: '2.5px solid #fff',
                            boxShadow: `0 0 0 3px rgba(249,115,22,.22)`,
                          }} />
                          <div style={{ width: 1, flex: 1, background: C.border, minHeight: 8, marginTop: 3 }} />
                        </>
                      ) : (
                        <>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 7,
                            background: '#fff', border: `2px solid ${C.dot}`,
                          }} />
                          <div style={{ width: 1, flex: 1, background: C.border, minHeight: 8, marginTop: 3 }} />
                        </>
                      )}
                    </div>

                    {/* card del evento */}
                    <div style={{ flex: 1, paddingBottom: 8 }}>
                      {item.active ? (
                        <div style={{
                          background: C.blue, borderRadius: 12, padding: '10px 12px',
                          boxShadow: '0 4px 18px rgba(249,115,22,.28)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <div style={{
                              width: 22, height: 22, borderRadius: 6,
                              background: 'rgba(255,255,255,.22)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Clock size={11} color="#fff" />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{item.title}</span>
                          </div>
                          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.7)', paddingLeft: 28 }}>{item.sub}</p>
                        </div>
                      ) : (
                        <div style={{
                          background: '#fff', borderRadius: 10, padding: '7px 10px',
                          border: `1px solid ${C.border}`, cursor: 'pointer',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.blueLight }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                        >
                          <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={9} color={C.textSub} />
                            <span style={{ fontSize: 10, color: C.textSub }}>{item.sub}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ━━━ PRÓXIMOS EVENTOS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Próximos eventos</span>
              <button style={{
                fontSize: 12, fontWeight: 700, color: C.blue,
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Ver todos
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {eventosProximos.map((ev) => (
                <div key={ev.title}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 10, padding: '4px 2px', transition: 'background .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.blueLight }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* thumbnail */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: ev.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {ev.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.35, marginBottom: 3 }}>
                      {ev.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={9} color={C.textSub} />
                      <span style={{ fontSize: 10, color: C.textSub }}>{ev.date}  ·  {ev.time}</span>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2 }}>
                    <MoreVertical size={15} color={C.dot} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>{/* fin col derecha */}
      </div>{/* fin flex principal */}
    </div>
  )
}
