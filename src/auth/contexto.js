import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// { estado, perfil, aviso, recuperando, modoDemo, iniciarSesion, cerrarSesion, ... }
// `perfil` es la fila de mi_perfil(): { tipo, id, nombre, rol, sucursal_id, sucursal, es_almacen } más `correo`.
export const useAuth = () => useContext(AuthContext)
