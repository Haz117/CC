import { useState } from 'react'
import Pagination from '../../components/Pagination'
import TablaGenerica from '../../components/TablaGenerica'
import AvisoError from '../../components/AvisoError'
import { SkeletonTableRows } from '../../components/Skeleton'
import { useConsulta } from '../../hooks/useConsulta'
import { useSucursales } from '../../hooks/useSucursales'
import { listarBitacora } from '../../api/sistema'
import { listarUsuarios } from '../../api/organizacion'

const BITACORA_POR_PAGINA = 15

/* ── Bitácora: auditoría de cada acción (tabla bitacora) ───── */
export default function Bitacora() {
  const [page, setPage] = useState(1)
  const { nombreCorto } = useSucursales()
  const usuarios = useConsulta(listarUsuarios)
  const { datos, cargando, error, recargar } = useConsulta(
    () => listarBitacora({ pagina: page - 1, porPagina: BITACORA_POR_PAGINA }),
    [page],
  )
  const nombres = new Map((usuarios.datos ?? []).map(u => [u.id, u.nombre_completo]))

  return (
    <div className="card overflow-hidden animate-fade-in-up">
      <div className="px-6 pt-6">
        <div className="card-header">
          <div>
            <p className="section-title">Bitácora de acciones</p>
            <p className="section-sub">{datos ? `${datos.total.toLocaleString('es-MX')} registros · del más reciente al más antiguo` : 'Auditoría de lo que se hace en las cajas'}</p>
          </div>
        </div>
      </div>
      <AvisoError error={error} onReintentar={recargar} className="mx-6 mb-6" />
      {cargando
        ? <div className="px-6 pb-6"><SkeletonTableRows rows={6} /></div>
        : datos?.filas.length > 0
          ? <TablaGenerica
              filas={datos.filas}
              primero={['fecha', 'folio']}
              titulos={{ accion: 'Acción', descripcion: 'Descripción' }}
              resolver={{ usuario_id: id => nombres.get(id) ?? '—', sucursal_id: nombreCorto }}
            />
          : !error && <p className="px-6 pb-6 text-sm" style={{ color: '#627080' }}>Sin registros en la bitácora.</p>}
      <Pagination total={datos?.total ?? 0} page={page} perPage={BITACORA_POR_PAGINA} onChange={setPage} />
    </div>
  )
}
