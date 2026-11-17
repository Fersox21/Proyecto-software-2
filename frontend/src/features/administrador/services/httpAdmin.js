import { cerrarSesion, obtenerSesion } from '../../auth/services/authService'

export const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function construirHeaders(conJson = true, headersExtra = {}) {
  const token = obtenerSesion()
  const base = {}
  if (token) {
    base.Authorization = `Bearer ${token}`
  }
  if (conJson) {
    base['Content-Type'] = 'application/json'
  }
  return {
    ...base,
    ...headersExtra,
  }
}

function redirigirALogin() {
  cerrarSesion()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login')
  }
}

export async function pedirAdmin(
  url,
  opciones = {},
  mensajeErrorPorDefecto = 'No se pudo completar la operación',
) {
  const esFormData = opciones.body instanceof FormData
  let respuesta

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: construirHeaders(!esFormData, opciones.headers),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  if (respuesta.status === 401) {
    redirigirALogin()
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
  }

  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  let datos = null
  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    const mensaje =
      respuesta.status === 403
        ? datos?.error || datos?.mensaje || datos?.message || 'No tenés permisos para realizar esta acción.'
        : datos?.error || datos?.mensaje || datos?.message || mensajeErrorPorDefecto
    const error = new Error(mensaje)
    error.status = respuesta.status
    throw error
  }

  return datos
}
