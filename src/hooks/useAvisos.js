import { useMemo } from 'react'
import { AlertTriangle, Info, PackageSearch, XCircle } from 'lucide-react'
import { useConsulta } from './useConsulta'
import { useAuth } from '../auth/contexto'
import { contarAvisos } from '../api/sistema'
import { inicioDelDia } from '../utils/fmt'

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

// Avisos del encabezado y globos del menú. Salen de conteos sobre tablas que cambian en vivo,
// así que se actualizan solos cuando una caja sube una venta, un corte o un pedido.
export function useAvisos() {
  const { perfil } = useAuth()
  const { datos } = useConsulta(
    () => contarAvisos({ hoy: inicioDelDia().toISOString() }),
    [perfil.id],
    { enVivo: ['ventas', 'turnos_caja', 'ordenes_reabastecimiento'] },
  )

  return useMemo(() => {
    const c = datos ?? {}
    const lista = [
      c.ordenesPendientes > 0 && {
        id: 'ordenes', tipo: 'error', Icon: PackageSearch, path: '/inventario',
        texto: `${plural(c.ordenesPendientes, 'producto bajó', 'productos bajaron')} del mínimo: reabastecimiento pendiente`,
      },
      c.cortesConDiferencia > 0 && {
        id: 'cortes', tipo: 'error', Icon: AlertTriangle, path: '/cajas',
        texto: `${plural(c.cortesConDiferencia, 'corte de caja de hoy cerró', 'cortes de caja de hoy cerraron')} con diferencia`,
      },
      c.canceladasHoy > 0 && {
        id: 'canceladas', tipo: 'aviso', Icon: XCircle, path: '/ventas',
        texto: `${plural(c.canceladasHoy, 'venta cancelada', 'ventas canceladas')} hoy`,
      },
      c.cajasAbiertas > 0 && {
        id: 'cajas', tipo: 'info', Icon: Info, path: '/cajas',
        texto: `${plural(c.cajasAbiertas, 'caja abierta', 'cajas abiertas')} en este momento`,
      },
    ].filter(Boolean)

    return {
      lista,
      // Globo de cada página del menú
      globos: {
        '/inventario': c.ordenesPendientes > 0 ? { n: c.ordenesPendientes, rojo: true } : null,
        '/cajas':      c.cajasAbiertas > 0 ? { n: c.cajasAbiertas } : null,
      },
    }
  }, [datos])
}
