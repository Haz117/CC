import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Mail, Phone, MoreVertical, Clock } from 'lucide-react'
import { perfData, donutData, distribuidores, timeline, eventosProximos } from '../data/dashboard'

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

/* Semaphore color by pct threshold */
function donutColor(pct) {
  if (pct >= 90) return '#059669'
  if (pct >= 70) return '#d97706'
  return '#C97A6D'
}

/* Donut circular (SVG manual) */
const Donut = memo(function Donut({ pct, size = 76, sw = 9 }) {
  const r  = (size - sw) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const filled = (pct / 100) * circumference
  const stroke = donutColor(pct)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Anillo de fondo */}
      <circle cx={cx} cy={cy} r={r}
        fill="none" stroke={C.blueRing} strokeWidth={sw} />
      {/* Arco relleno */}
      <circle cx={cx} cy={cy} r={r}
        fill="none" stroke={stroke} strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cy})`} />
      {/* Porcentaje centrado */}
      <text x="50%" y="50%"
        textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 13, fontWeight: 800, fill: stroke, fontFamily: 'Inter,sans-serif' }}>
        {pct}%
      </text>
    </svg>
  )
})

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

/* Tooltip del gráfico */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '7px 12px',
      boxShadow: '0 4px 16px rgba(249,115,22,.12)',
      border: `1px solid ${C.blueRing}`,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.textSub }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 800, color: C.blue }}>{payload[0].value}%</p>
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
export default function Dashboard({ user }) {
  const navigate  = useNavigate()
  const [period, setPeriod] = useState('Agosto')

  const now       = new Date()
  const firstName = user?.nombre?.split(' ')[0] || 'Administrador'
  const hour      = now.getHours()
  const greeting  = hour < 13 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const best      = [...perfData].sort((a, b) => b.pct - a.pct)[0]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ═══════════════════════════════════════════════════════
          GRID PRINCIPAL: col-izq (flex:1)  +  col-der (280px)
      ══════════════════════════════════════════════════════ */}
      <div className="dashboard-grid">

        {/* ─────────────── COLUMNA IZQUIERDA ─────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ━━━ 1. BANNER DE BIENVENIDA ━━━━━━━━━━━━━━━━━━━ */}
          <div className="card" style={{ display: 'flex', overflow: 'hidden', minHeight: 148 }}>
            {/* Texto */}
            <div style={{ flex: 1, padding: '26px 28px' }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: '-.03em', marginBottom: 8 }}>
                {greeting}, {firstName}!
              </h1>
              <p style={{ fontSize: 13, color: '#627080', lineHeight: 1.6, marginBottom: 14, maxWidth: 320 }}>
                Tienes <strong style={{ color: '#C97A6D' }}>4 alertas activas</strong> y{' '}
                <strong style={{ color: C.blue }}>3 rutas en proceso</strong>.
                ¡Es un día movido! ¡Vamos a trabajar!
              </p>
              <button onClick={() => navigate('/inventario')} style={{
                background: C.blueLight, border: `1.5px solid rgba(249,115,22,.22)`,
                padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                fontSize: 11, fontWeight: 700, color: C.blue, fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                Revisar alertas <span style={{ fontSize: 13 }}>→</span>
              </button>
            </div>

            {/* Ilustración */}
            <div className="dashboard-welcome-illus" style={{
              width: 210,
              background: '#FFF7ED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 210 148" width="210" height="148">
                {/* sombra círculos decorativos */}
                <circle cx="165" cy="28" r="28" fill="rgba(249,115,22,.18)" />
                <circle cx="45"  cy="128" r="18" fill="rgba(249,115,22,.13)" />

                {/* mesa */}
                <rect x="14" y="106" width="164" height="10" rx="4" fill="#FED7AA"/>
                <rect x="26"  y="116" width="10" height="24" rx="3" fill="#F97316"/>
                <rect x="158" y="116" width="10" height="24" rx="3" fill="#F97316"/>

                {/* monitor */}
                <rect x="44"  y="54"  width="108" height="50" rx="7" fill={C.blue}/>
                <rect x="51"  y="61"  width="94"  height="36" rx="4" fill="#EA580C"/>

                {/* gráfica en pantalla */}
                <rect x="60"  y="84"  width="11" height="10" rx="2" fill="#34d399"/>
                <rect x="75"  y="77"  width="11" height="17" rx="2" fill="#34d399"/>
                <rect x="90"  y="69"  width="11" height="25" rx="2" fill="#6EE7B7"/>
                <rect x="105" y="75"  width="11" height="19" rx="2" fill="#34d399"/>
                <rect x="120" y="65"  width="11" height="29" rx="2" fill="#6EE7B7"/>
                <polyline points="65,84 80,77 95,69 110,75 125,65"
                  fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>

                {/* soporte monitor */}
                <rect x="94" y="104" width="14" height="5" rx="2" fill="#FED7AA"/>
                <rect x="84" y="109" width="34" height="3" rx="2" fill="#FED7AA"/>

                {/* cuerpo personaje */}
                <rect x="136" y="68" width="32" height="32" rx="8" fill={C.blue}/>
                {/* brazo izq en escritorio */}
                <rect x="120" y="76" width="18" height="9"  rx="4.5" fill={C.blue}/>
                {/* brazo der saludando */}
                <rect x="168" y="55" width="8"  height="18" rx="4" fill="#FBBF24"/>
                <circle cx="172" cy="51" r="6" fill="#FBBF24"/>

                {/* cabeza */}
                <circle cx="152" cy="48" r="17" fill="#FBBF24"/>
                {/* sombrero */}
                <rect x="137" y="35" width="30" height="6"  rx="3" fill={C.blue}/>
                <rect x="143" y="24" width="18" height="13" rx="4" fill={C.blue}/>
                <text x="152" y="33" textAnchor="middle" style={{ fontSize: 8, fill: '#FDE68A' }}>★</text>

                {/* cara */}
                <circle cx="146" cy="47" r="2.2" fill="#263442"/>
                <circle cx="158" cy="47" r="2.2" fill="#263442"/>
                <circle cx="147" cy="46" r=".9" fill="#fff"/>
                <circle cx="159" cy="46" r=".9" fill="#fff"/>
                <path d="M146 55 Q152 60 158 55"
                  fill="none" stroke="#263442" strokeWidth="1.4" strokeLinecap="round"/>

                {/* planta */}
                <rect x="18" y="94" width="10" height="14" rx="2" fill="#FED7AA"/>
                <ellipse cx="23" cy="90" rx="9" ry="7" fill="#34d399"/>
                <ellipse cx="16" cy="94" rx="7" ry="5" fill="#059669"/>
                <ellipse cx="30" cy="94" rx="7" ry="5" fill="#059669"/>
              </svg>
            </div>
          </div>

          {/* ━━━ 2. PERFORMANCE  +  MY VISIT  (lado a lado) ━━━ */}
          <div className="dashboard-panels">

            {/* ── PERFORMANCE (3 partes) ─────────────────── */}
            <div className="card p-5" style={{ flex: 3, minWidth: 0 }}>
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
                  <CartesianGrid strokeDasharray="3 0" stroke="#F5EDE6" vertical={false} />
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

            {/* ── MY VISIT / DONUTS (2 partes) ───────────── */}
            <div className="card p-5" style={{ flex: 2, minWidth: 0 }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Mis visitas</span>
                <PeriodChip value={period} onChange={setPeriod} />
              </div>

              {/* leyenda semáforo */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                {[['#059669','≥90%'],['#d97706','70–89%'],['#C97A6D','<70%']].map(([c, lbl]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span className="donut-status-dot" style={{ background: c }} />
                    <span style={{ fontSize: 9, fontWeight: 600, color: C.textSub }}>{lbl}</span>
                  </div>
                ))}
              </div>

              {/* 2 columnas × 3 filas de donuts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 18, columnGap: 4 }}>
                {donutData.map(d => (
                  <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <Donut pct={d.pct} size={76} sw={9} />
                    <p style={{ fontSize: 10, fontWeight: 600, color: C.textSub, textAlign: 'center', lineHeight: 1.3 }}>
                      {d.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ━━━ 3. DISTRIBUIDORES (Linked Teachers) ━━━━━━━ */}
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
