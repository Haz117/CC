// Supabase Auth exige contraseñas de mínimo 8 caracteres.
export const validarContrasena = (nueva, repetida) => {
  if (nueva.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (nueva !== repetida) return 'Las contraseñas no coinciden.'
  return ''
}

export const esCorreo = (texto) => /^\S+@\S+\.\S+$/.test(texto)
