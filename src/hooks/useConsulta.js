import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { escucharTabla } from '../lib/tiempoReal'
import { esDemo } from '../api/fuente'
import { marcarSincronizado } from '../lib/sincronizacion'

const ESPERA_EN_VIVO = 1500          // junta varios cambios seguidos en una sola recarga
const MINIMO_ENTRE_RECARGAS = 10000  // con muchas ventas seguidas no se recarga más de una vez cada 10 s

/**
 * Corre una consulta de src/api y la repite cuando cambian `deps` (valores simples),
 * cuando se pulsa "Actualizar" en el encabezado y cuando cambia alguna tabla de `enVivo`.
 * Al recargar conserva los datos anteriores (`actualizando`) para que la pantalla no parpadee.
 */
export function useConsulta(consultar, deps = [], { enVivo = [], activo = true } = {}) {
  const [estado, setEstado] = useState({ datos: undefined, error: null, cargando: activo, actualizando: false })
  const consultaRef = useRef(consultar)
  const pedido = useRef(0)
  const ultimaCarga = useRef(0)

  useLayoutEffect(() => { consultaRef.current = consultar })

  const recargar = useCallback(async () => {
    const id = ++pedido.current
    ultimaCarga.current = Date.now()
    setEstado(e => ({ ...e, cargando: e.datos === undefined, actualizando: e.datos !== undefined }))
    try {
      const datos = await consultaRef.current()
      marcarSincronizado()
      if (id === pedido.current) setEstado({ datos, error: null, cargando: false, actualizando: false })
    } catch (error) {
      if (id === pedido.current) setEstado(e => ({ ...e, error, cargando: false, actualizando: false }))
    }
  }, [])

  const clave = JSON.stringify(deps)
  useEffect(() => {
    if (activo) recargar()
    // Al cambiar los filtros o salir de la pantalla, la respuesta que venga en camino se descarta.
    const contador = pedido
    return () => { contador.current++ }
  }, [activo, recargar, clave])

  useEffect(() => {
    if (!activo) return
    window.addEventListener('app:refrescar', recargar)
    return () => window.removeEventListener('app:refrescar', recargar)
  }, [activo, recargar])

  const tablas = enVivo.join(',')
  // Si la base todavía no tiene la tabla (las de ruta, antes de la migración), no se escucha:
  // Realtime reintentaría suscribirse a ella sin fin.
  const sinTablas = estado.error?.codigo === 'SIN_TABLAS'
  useEffect(() => {
    if (!activo || !tablas || esDemo() || sinTablas) return
    let temporizador
    const programar = () => {
      clearTimeout(temporizador)
      const desdeUltima = Date.now() - ultimaCarga.current
      temporizador = setTimeout(recargar, Math.max(ESPERA_EN_VIVO, MINIMO_ENTRE_RECARGAS - desdeUltima))
    }
    const bajas = tablas.split(',').map(tabla => escucharTabla(tabla, programar))
    return () => {
      clearTimeout(temporizador)
      bajas.forEach(baja => baja())
    }
  }, [activo, tablas, recargar, sinTablas])

  return { ...estado, recargar }
}
