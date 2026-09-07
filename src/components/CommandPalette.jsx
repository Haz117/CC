import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Building2, Monitor, ShoppingCart, Package,
  Truck, MapPin, ShoppingBag, BarChart3, Users, Settings, Plus,
  Scissors, X, ArrowRight,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard',        path: '/dashboard',      Icon: LayoutDashboard, group: 'Navegar' },
  { label: 'Ventas',           path: '/ventas',          Icon: ShoppingCart,    group: 'Navegar' },
  { label: 'Inventario',       path: '/inventario',      Icon: Package,         group: 'Navegar' },
  { label: 'Cajas',            path: '/cajas',           Icon: Monitor,         group: 'Navegar' },
  { label: 'Sucursales',       path: '/sucursales',      Icon: Building2,       group: 'Navegar' },
  { label: 'Distribuidores',   path: '/distribuidores',  Icon: Truck,           group: 'Navegar' },
  { label: 'Rutas',            path: '/rutas',           Icon: MapPin,          group: 'Navegar' },
  { label: 'Compras',          path: '/compras',         Icon: ShoppingBag,     group: 'Navegar' },
  { label: 'Reportes',         path: '/reportes',        Icon: BarChart3,       group: 'Navegar' },
  { label: 'Usuarios',         path: '/usuarios',        Icon: Users,           group: 'Navegar' },
  { label: 'Configuración',    path: '/configuracion',   Icon: Settings,        group: 'Navegar' },
]

const ACTIONS = [
  { label: 'Nueva venta',           path: '/ventas',         Icon: Plus,     group: 'Acciones rápidas' },
  { label: 'Nuevo producto',        path: '/inventario',     Icon: Plus,     group: 'Acciones rápidas' },
  { label: 'Nueva orden de compra', path: '/compras',        Icon: Plus,     group: 'Acciones rápidas' },
  { label: 'Registrar corte',       path: '/cajas',          Icon: Scissors, group: 'Acciones rápidas' },
  { label: 'Nuevo distribuidor',    path: '/distribuidores', Icon: Plus,     group: 'Acciones rápidas' },
  { label: 'Ver reportes',          path: '/reportes',       Icon: BarChart3,group: 'Acciones rápidas' },
]

const ALL = [...NAV, ...ACTIONS]

const GROUP_COLORS = {
  'Navegar':          { bg: '#FFF7ED', icon: '#F97316', activeBg: '#F97316' },
  'Acciones rápidas': { bg: 'rgba(5,150,105,.08)', icon: '#059669', activeBg: '#059669' },
}

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery]     = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef  = useRef(null)
  const listRef   = useRef(null)
  const navigate  = useNavigate()

  const results = useMemo(() =>
    query.trim().length === 0
      ? ALL
      : ALL.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.group.toLowerCase().includes(query.toLowerCase())
        )
  , [query])

  const grouped = useMemo(() => results.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {}), [results])

  /* flat index map: label → absolute index, built once per results change */
  const flatMap = useMemo(() => {
    const map = {}
    let i = 0
    for (const item of results) { map[item.label] = i++ }
    return map
  }, [results])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => { setActiveIdx(0) }, [query])

  const handleSelect = useCallback((item) => {
    navigate(item.path)
    onClose()
  }, [navigate, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIdx]) {
        e.preventDefault()
        handleSelect(results[activeIdx])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, activeIdx, results, handleSelect, onClose])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: 'rgba(6,20,38,.6)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: '#fff',
          boxShadow: '0 40px 100px rgba(194,65,12,.32), 0 0 0 1px rgba(0,0,0,.06)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #FDE8D0' }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#FED7AA' }} />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-activedescendant={`cp-item-${activeIdx}`}
            placeholder="Buscar páginas y acciones..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base font-medium"
            style={{ color: '#263442' }}
          />
          <button
            onClick={onClose}
            aria-label="Cerrar paleta de comandos"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: '#F2F3F5', color: '#8FA1B2' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FDE8D0' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F2F3F5' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div
          id="command-palette-list"
          ref={listRef}
          role="listbox"
          aria-label="Resultados"
          className="overflow-y-auto py-2"
          style={{ maxHeight: '22rem' }}
        >
          {Object.entries(grouped).map(([group, items]) => {
            const gc = GROUP_COLORS[group] || GROUP_COLORS['Navegar']
            return (
              <div key={group}>
                <div className="px-4 pt-3 pb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#FED7AA' }}>
                    {group}
                  </p>
                </div>
                {items.map(item => {
                  const idx = flatMap[item.label]
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={item.label}
                      id={`cp-item-${idx}`}
                      role="option"
                      aria-selected={isActive}
                      data-idx={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className="group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ background: isActive ? '#FFF7ED' : 'transparent' }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isActive ? gc.activeBg : gc.bg,
                          boxShadow: isActive ? `0 2px 8px ${gc.activeBg}40` : 'none',
                        }}
                      >
                        <item.Icon className="w-4 h-4" style={{ color: isActive ? '#fff' : gc.icon }} />
                      </div>
                      <span className="text-sm font-medium flex-1" style={{ color: isActive ? '#C2410C' : '#263442' }}>
                        {item.label}
                      </span>
                      {isActive ? (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ background: '#F97316', color: '#fff' }}
                        >
                          ↵
                        </span>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#D4DDE6' }} />
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}

          {results.length === 0 && (
            <div className="py-14 text-center">
              <Search className="w-8 h-8 mx-auto mb-3" style={{ color: '#D4DDE6' }} />
              <p className="text-sm font-medium" style={{ color: '#8FA1B2' }}>
                Sin resultados para "<span style={{ color: '#263442' }}>{query}</span>"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2.5"
          style={{ borderTop: '1px solid #F2F3F5', background: '#F2F3F5' }}
        >
          {[['↑↓', 'navegar'], ['↵', 'abrir'], ['esc', 'cerrar']].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: '#FED7AA' }}>
              <kbd
                className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                style={{ background: '#FDE8D0', color: '#627080', border: '1px solid #D4DDE6' }}
              >
                {key}
              </kbd>
              {label}
            </span>
          ))}
          <span className="ml-auto text-[10px] font-medium" style={{ color: '#D4DDE6' }}>
            Ctrl+K
          </span>
        </div>
      </div>
    </div>
  )
}
