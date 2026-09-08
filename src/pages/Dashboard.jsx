import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, ReferenceLine,
} from 'recharts'
import {
  DollarSign, Truck, AlertTriangle, LayoutGrid,
  Clock, TrendingUp, ChevronRight, Mail, Phone,
} from 'lucide-react'
import { perfData, distribuidores, timeline } from '../data/dashboard'

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const pct = payload[0].value
  const color = pct >= 80 ? '#059669' : pct < 70 ? '#C97A6D' : '#d97706'
  const arrow = pct >= 80 ? '↑' : pct < 70 ? '↓' : '—'
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 20px rgba(0,0,0,.1)', border: '1px solid #FDE8D0' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#8FA1B2', marginBottom: 2 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 900, color: '#263442' }}>{pct}%</p>
        <span style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{arrow}</span>
      </div>
    </div>
  )
}

function BarLbl({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle"
      style={{ fontSize: 9, fontWeight: 700, fill: '#8FA1B2', fontFamily: 'Inter,sans-serif' }}>
      {value}
    </text>
  )
}

const ini = n => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

/* ════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════ */
export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('Agosto')

  const best    = useMemo(() => [...perfData].sort((a, b) => b.pct - a.pct)[0], [])
  const avgPct  = useMemo(() => Math.round(perfData.reduce((s, d) => s + d.pct, 0) / perfData.length), [])
  const agendaItems = useMemo(() => timeline.filter(t => t.title), [])

  const nombre = user?.nombre?.split(' ')[0] || 'Admin'
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const kpis = [
    { Icon: DollarSign,    label: 'Ventas hoy',     value: '$42,850', sub: '+8% vs ayer',         good: true,  iconColor: '#F97316', iconBg: '#FFF7ED' },
    { Icon: Truck,         label: 'Rutas activas',   value: '4 / 6',   sub: '2 pendientes',                     iconColor: '#2F8CEB', iconBg: '#EBF5FF' },
    { Icon: AlertTriangle, label: 'Stock crítico',   value: '3',       sub: 'Por surtir',          alert: true, iconColor: '#C97A6D', iconBg: 'rgba(201,122,109,.1)' },
    { Icon: LayoutGrid,    label: 'Cajas abiertas',  value: '8 / 10',  sub: '2 inactivas',                      iconColor: '#059669', iconBg: 'rgba(5,150,105,.1)' },
  ]

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="page-hero" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
          <div>
            <p className="page-hero-sub" style={{ marginBottom: 4 }}>Panel principal · {period}</p>
            <h1 className="page-hero-title">{saludo}, {nombre}</h1>
            <p className="page-hero-sub" style={{ marginTop: 4 }}>Resumen de operaciones — hoy</p>
          </div>
          <div className="page-hero-actions">
            <div className="hero-badge-live"><span className="live-dot" />En vivo</div>
            <button
              onClick={() => { const o = ['Agosto','Julio','Junio']; setPeriod(p => o[(o.indexOf(p)+1)%o.length]) }}
              style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {period} ▾
            </button>
          </div>
        </div>
      </div>

      {/* ══ KPI GRID ══════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {kpis.map(({ Icon, label, value, sub, good, alert, iconColor, iconBg }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={iconColor} />
              </div>
              {good  && <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,.08)', padding: '3px 8px', borderRadius: 99, border: '1px solid rgba(5,150,105,.15)' }}>+8%</span>}
              {alert && <span className="red-dot" style={{ marginTop: 5 }} />}
            </div>
            <p style={{ fontSize: '1.55rem', fontWeight: 900, color: '#263442', letterSpacing: '-.04em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '.67rem', fontWeight: 700, color: '#8FA1B2', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</p>
            <p style={{ fontSize: '.72rem', color: good ? '#059669' : alert ? '#C97A6D' : '#8FA1B2', marginTop: 3 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ══ GRID 60/40 ════════════════════════════════════════ */}
      <div className="dashboard-grid">

        {/* ─── COLUMNA IZQUIERDA (60%) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Rendimiento por sucursal */}
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, gap: 8, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#263442' }}>Rendimiento por sucursal</p>
                <p style={{ fontSize: 11, color: '#8FA1B2', marginTop: 2 }}>
                  Mejor: <strong style={{ color: '#263442' }}>{best.name}</strong> — {best.pct}%
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: avgPct >= 80 ? 'rgba(5,150,105,.08)' : 'rgba(217,119,6,.08)', border: `1px solid ${avgPct >= 80 ? 'rgba(5,150,105,.2)' : 'rgba(217,119,6,.2)'}` }}>
                  <TrendingUp size={11} color={avgPct >= 80 ? '#059669' : '#d97706'} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: avgPct >= 80 ? '#059669' : '#d97706' }}>{avgPct}% prom.</span>
                </div>
                <button
                  onClick={() => navigate('/sucursales')}
                  style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8, border: '1.5px solid #D4DDE6', background: '#fff', color: '#263442', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Ver todas
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perfData} barCategoryGap="32%" margin={{ top: 24, left: -30, right: 4, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 0" stroke="#FDE8D0" vertical={false} />
                <XAxis dataKey="name"
                  tick={{ fontSize: 9, fill: '#8FA1B2', fontWeight: 600 }}
                  axisLine={false} tickLine={false}
                  interval={0} angle={-28} textAnchor="end" height={40} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(249,115,22,.06)', radius: [6,6,0,0] }} />
                <ReferenceLine y={80} stroke="#059669" strokeDasharray="5 3"
                  label={{ value: 'Meta', position: 'right', fontSize: 9, fill: '#059669', fontWeight: 700 }}
                />
                <Bar dataKey="pct" radius={[7,7,2,2]}>
                  <LabelList content={<BarLbl />} />
                  {perfData.map((d, i) => (
                    <Cell key={i} fill={d.pct >= 80 ? '#059669' : d.pct >= 60 ? '#d97706' : '#C97A6D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuidores */}
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#263442' }}>Distribuidores activos</p>
              <button
                onClick={() => navigate('/distribuidores')}
                style={{ fontSize: 12, fontWeight: 700, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Ver todos
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {distribuidores.map((d, i) => (
                <div key={d.nombre}>
                  {i > 0 && <div style={{ height: 1, background: '#FDE8D0', margin: '0 4px' }} />}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFF7ED' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: d.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: d.color }}>
                      {ini(d.nombre)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#263442' }}>{d.nombre}</p>
                      <p style={{ fontSize: 11, color: '#8FA1B2' }}>{d.rol}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[[Mail, 'mail'], [Phone, 'phone']].map(([Icon, key]) => (
                        <button key={key}
                          style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#FFF7ED', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FDBA74' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FFF7ED' }}
                        >
                          <Icon size={13} color="#F97316" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── COLUMNA DERECHA (40%) ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="card p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#263442' }}>Agenda de hoy</p>
                <p style={{ fontSize: 10, color: '#8FA1B2', marginTop: 2 }}>{agendaItems.length} eventos programados</p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 7, border: '1.5px solid #D4DDE6', background: '#fff', color: '#263442' }}>Hoy</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {agendaItems.map((item, i) => (
                <div key={i}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 12, background: item.active ? '#F97316' : '#F2F3F5', cursor: 'pointer', transition: 'background .15s' }}
                  onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = '#FFF7ED' }}
                  onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = '#F2F3F5' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: item.active ? 'rgba(255,255,255,.2)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={14} color={item.active ? '#fff' : '#F97316'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: item.active ? '#fff' : '#263442', lineHeight: 1.3, marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 10, color: item.active ? 'rgba(255,255,255,.7)' : '#8FA1B2' }}>{item.time} · {item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{ width: '100%', marginTop: 12, padding: '9px', borderRadius: 10, border: '1.5px solid #D4DDE6', background: '#fff', color: '#8FA1B2', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.borderColor = '#FDBA74'; e.currentTarget.style.color = '#C2410C' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#D4DDE6'; e.currentTarget.style.color = '#8FA1B2' }}
            >
              Ver agenda completa <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
