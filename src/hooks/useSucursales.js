import { useMemo } from 'react'
import { useConsulta } from './useConsulta'
import { listarSucursales } from '../api/organizacion'

const corto = (nombre) => String(nombre ?? '').replace(/^Sucursal\s+/i, '')

// Catálogo de sucursales para poner nombre a los `sucursal_id` y llenar los filtros.
export function useSucursales() {
  const { datos, error } = useConsulta(listarSucursales)

  return useMemo(() => {
    const sucursales = datos ?? []
    const porId = new Map(sucursales.map(s => [s.id, s]))
    return {
      sucursales,
      error,
      cargando: datos === undefined && !error,
      nombreSucursal: (id) => porId.get(id)?.nombre ?? '—',
      nombreCorto:    (id) => corto(porId.get(id)?.nombre) || '—',
    }
  }, [datos, error])
}
