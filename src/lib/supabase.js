import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

// La secret key / service_role se salta la seguridad por sucursal:
// nunca va en el navegador ni en el repositorio de la web.
function esLlaveSecreta(k) {
  if (k.startsWith('sb_secret_')) return true
  try {
    const payload = k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).role === 'service_role'
  } catch {
    return false
  }
}

export const errorConfiguracion = key && esLlaveSecreta(key)
  ? 'VITE_SUPABASE_PUBLISHABLE_KEY contiene una secret key (service_role). Cámbiala por la publishable key.'
  : null

export const supabaseConfigurado = Boolean(url && key) && !errorConfiguracion

/* ── Entrar con usuario y contraseña ─────────────────────────
   En pantalla se entra con usuario, pero Supabase Auth solo identifica cuentas por correo (rechaza
   lo que no lleve @). Por eso cada cuenta se crea en el panel con un correo interno, usuario@<dominio>,
   y la app lo arma sola: quien escribe "luis" entra como luis@cremerias.local.
   El dominio es interno a propósito: no recibe correo, así que nadie puede pedir un enlace de
   recuperación a nombre de otro. Se cambia con VITE_DOMINIO_USUARIOS. */
const dominioUsuarios = (import.meta.env.VITE_DOMINIO_USUARIOS?.trim().replace(/^@/, '') || 'cremerias.local').toLowerCase()

// Correo interno con el que se le pregunta a Auth por un usuario.
export function aCorreo(usuario) {
  const texto = usuario.trim().toLowerCase()
  return texto.includes('@') ? texto : `${texto}@${dominioUsuarios}`
}

/* ── "Mantener sesión iniciada" ──────────────────────────────
   Marcado: la sesión se guarda en localStorage y sobrevive al cerrar el navegador.
   Sin marcar: va en sessionStorage y se pierde al cerrar la pestaña. */
const CLAVE_RECORDAR = 'cremeria-recordar-sesion'

export const getRecordarSesion = () => localStorage.getItem(CLAVE_RECORDAR) !== '0'
export const setRecordarSesion = (recordar) => localStorage.setItem(CLAVE_RECORDAR, recordar ? '1' : '0')

const almacenSesion = {
  getItem: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k, v) => {
    const [destino, otro] = getRecordarSesion() ? [localStorage, sessionStorage] : [sessionStorage, localStorage]
    destino.setItem(k, v)
    otro.removeItem(k)
  },
  removeItem: (k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  },
}

// La web habla con la API de Supabase (REST, Auth y Realtime); nunca directo a Postgres.
// La sesión dura 1 hora y supabase-js la renueva sola.
export const supabase = supabaseConfigurado
  ? createClient(url, key, { auth: { storage: almacenSesion } })
  : null
