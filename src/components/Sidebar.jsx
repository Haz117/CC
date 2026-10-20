import { NavLink, useMatch, useResolvedPath } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { useAuth } from '../auth/contexto'
import { PAGINAS, etiquetaRol } from '../lib/navegacion'
import { iniciales } from '../utils/fmt'
import { useSincronizacion } from '../lib/sincronizacion'
import Logo from './Logo'

// Menú lateral oscuro (marrón cálido), a juego con el login y el splash.
const C = {
  border:  'rgba(255,255,255,.09)',
  text:    '#FFFFFF',
  sub:     'rgba(255,255,255,.58)',
  icono:   'rgba(255,255,255,.6)',
  orange:  '#FB923C',   // sobre el fondo oscuro el naranja claro se lee mejor (8:1)
  tintA:   'rgba(249,115,22,.18)',   // fondo del ítem activo
  chip:    'rgba(255,255,255,.07)',  // recuadro del ícono inactivo
  chipA:   'rgba(249,115,22,.22)',   // recuadro del ícono activo
  hover:   'rgba(255,255,255,.055)',
}

// Agrupa las páginas por sección, conservando el orden del menú.
function agrupar() {
  const grupos = []
  for (const pagina of PAGINAS) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.label === pagina.grupo) ultimo.items.push(pagina)
    else grupos.push({ label: pagina.grupo, items: [pagina] })
  }
  return grupos
}

const GRUPOS = agrupar()

function NavItem({ path, icon: Icon, label, demo, globo, onClose }) {
  const resolved = useResolvedPath(path)
  const isActive = !!useMatch({ path: resolved.pathname, end: true })

  return (
    <NavLink
      to={path}
      onClick={onClose}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 10,
        background: isActive ? C.tintA : 'transparent',
        textDecoration: 'none',
        position: 'relative',
        transition: 'background .15s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.hover }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <Icon size={18} aria-hidden="true" style={{ color: isActive ? C.orange : C.icono, flexShrink: 0 }} strokeWidth={isActive ? 2.2 : 1.8} />

      <span style={{
        flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500,
        color: isActive ? C.text : C.sub,
        transition: 'color .15s',
      }}>
        {label}
      </span>

      {demo && (
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
          color: '#c4b5fd', background: 'rgba(167,139,250,.18)', padding: '2px 6px', borderRadius: 99,
        }}>
          demo
        </span>
      )}

      {globo && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: '#fff',
          background: globo.rojo ? '#8A4A42' : 'rgba(255,255,255,.22)', padding: '2px 6px',
          borderRadius: 99, lineHeight: 1.4,
        }}>
          {globo.n}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose, globos = {} }) {
  const { perfil, cerrarSesion } = useAuth()
  const groups = GRUPOS
  const rol = etiquetaRol(perfil?.rol)
  const { enLinea } = useSincronizacion()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 lg:hidden"
        style={{
          background: open ? 'rgba(20,10,6,.5)' : 'transparent',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'background .25s',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 left-0 h-full z-40 flex flex-col w-72 lg:translate-x-0 app-sidebar"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
          background: 'linear-gradient(180deg,#241812 0%,#17100B 100%)',
          borderRight: `1px solid ${C.border}`,
          boxShadow: open ? '8px 0 32px rgba(0,0,0,.35)' : 'none',
        }}
      >

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 64, flexShrink: 0,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={36} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>Cremerías Admin</p>
              <p style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{perfil?.sucursal || rol}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="xl:hidden!"
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: C.icono, transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.icono }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav aria-label="Navegación principal" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {groups.map((group, gi) => (
            <div key={gi} style={{ marginTop: gi > 0 ? 20 : 0 }}>
              {group.label && (
                <p style={{
                  fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.62)',
                  padding: '0 12px', marginBottom: 6,
                }}>
                  {group.label}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map(item => <NavItem key={item.path} {...item} globo={globos[item.path]} onClose={onClose} />)}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: '12px 10px', flexShrink: 0,
          borderTop: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            background: C.chip, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(249,115,22,.18)', border: '1px solid rgba(249,115,22,.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: C.orange,
            }}>
              {iniciales(perfil?.nombre)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}
                className="truncate">
                {perfil?.nombre}
              </p>
              <p style={{ fontSize: 11, color: C.sub, marginTop: 1 }}
                className="truncate">
                {rol} · <span style={enLinea ? undefined : { color: '#EBA89B' }}>{enLinea ? 'en línea' : 'sin conexión'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); cerrarSesion() }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(201,122,109,.16)', border: '1px solid rgba(201,122,109,.28)',
              color: '#EBA89B', fontFamily: 'inherit', textAlign: 'left',
              fontSize: 13, fontWeight: 600, transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,122,109,.26)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,122,109,.16)' }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
