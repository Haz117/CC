/* Base de la capa de datos: errores legibles, paginación y modo demostración.
   La web es de consulta: aquí solo hay lecturas (más `vincular_usuario`, que la guía permite al administrador). */

/* ── Modo demostración ───────────────────────────────────────
   Con un perfil de demostración activo, las funciones de src/api regresan datos de ejemplo
   (src/api/demo.js) con la misma forma que la base, sin tocar Supabase. */
let perfilDemo = null

export const esDemo        = () => perfilDemo !== null
export const fijarDemo     = (perfil) => { perfilDemo = perfil; limpiarCache() }
export const demo          = () => import('./demo')

/* ── Errores ─────────────────────────────────────────────── */
export class ErrorDatos extends Error {
  constructor(mensaje, codigo) {
    super(mensaje)
    this.name = 'ErrorDatos'
    this.codigo = codigo
  }
}

export function aErrorDatos(error) {
  const texto = error?.message || ''
  if (error?.code === '42501')
    return new ErrorDatos('Tu rol no tiene permiso para hacer esto.', error.code)
  if (error?.code === 'PGRST301' || /jwt/i.test(texto))
    return new ErrorDatos('Tu sesión expiró. Vuelve a iniciar sesión.', 'SESION')
  if (/failed to fetch|networkerror|load failed/i.test(texto))
    return new ErrorDatos('No se pudo conectar con el servidor. Revisa tu conexión a internet.', 'RED')
  return new ErrorDatos(texto || 'No se pudieron consultar los datos.', error?.code)
}

// Espera una consulta de supabase-js y regresa sus filas, o lanza un error legible.
export async function filas(consulta) {
  const { data, error } = await consulta
  if (error) throw aErrorDatos(error)
  return data ?? []
}

/* ── Paginación ──────────────────────────────────────────────
   La API regresa máximo 1,000 filas por petición: las listas largas se paginan siempre. */
const PAGINA = 1000

// Trae todas las filas de una consulta. `crear(opciones)` debe regresar una consulta nueva y ordenada.
// Se detiene en `tope` filas y lo avisa en `truncado`, para no sumar decenas de miles en el navegador.
export async function traerTodo(crear, { tope = 20000 } = {}) {
  const { data, error, count } = await crear({ count: 'exact' }).range(0, PAGINA - 1)
  if (error) throw aErrorDatos(error)

  const total = count ?? data.length
  const limite = Math.min(total, tope)
  const rangos = []
  for (let desde = PAGINA; desde < limite; desde += PAGINA) {
    rangos.push([desde, Math.min(desde + PAGINA, limite) - 1])
  }

  const todas = [...data]
  for (let i = 0; i < rangos.length; i += 4) {
    const lote = await Promise.all(rangos.slice(i, i + 4).map(([a, b]) => filas(crear().range(a, b))))
    lote.forEach(pagina => todas.push(...pagina))
  }

  // Si entran filas nuevas mientras se pagina, alguna puede repetirse entre páginas.
  const vistas = new Set()
  const unicas = todas.filter(f => {
    if (f.id == null) return true
    if (vistas.has(f.id)) return false
    vistas.add(f.id)
    return true
  })

  return { filas: unicas, total, truncado: total > limite }
}

/* ── Caché corto para catálogos que casi no cambian (sucursales) ── */
const cache = new Map()

export function conCache(clave, ms, consultar) {
  const guardado = cache.get(clave)
  if (guardado && Date.now() - guardado.en < ms) return guardado.promesa
  const promesa = consultar().catch(error => { cache.delete(clave); throw error })
  cache.set(clave, { promesa, en: Date.now() })
  return promesa
}

export const limpiarCache = () => cache.clear()
