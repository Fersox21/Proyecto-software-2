import { redirect } from 'react-router'

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
let ultimoLoginId = 0

async function leerJsonSeguro(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return { valido: false, datos: null }
  try {
    return { valido: true, datos: JSON.parse(texto) }
  } catch {
    return { valido: false, datos: null }
  }
}

function decodificarPayloadJwt(token) {
  if (typeof token !== 'string') return null
  const partes = token.split('.')
  if (partes.length !== 3 || partes.some((p) => !p)) return null

  try {
    const decodificarParte = (parte) => {
      const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
      const padding = (4 - (base64.length % 4)) % 4
      const bytes = Uint8Array.from(atob(`${base64}${'='.repeat(padding)}`), (c) => c.charCodeAt(0))
      return JSON.parse(new TextDecoder().decode(bytes))
    }

    const header = decodificarParte(partes[0])
    const payload = decodificarParte(partes[1])
    if (!header || typeof header !== 'object' || Array.isArray(header)) return null
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
    return payload
  } catch {
    return null
  }
}

function esJwtValidoYNoExpirado(token) {
  const payload = decodificarPayloadJwt(token)
  if (!payload) return false
  if (payload.exp != null) {
    const exp = Number(payload.exp)
    if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) {
      return false
    }
  }
  if (payload.rol != null && payload.rol !== 'admin') {
    return false
  }
  return true
}

export async function iniciarSesion({ email, password }) {
  const loginId = ++ultimoLoginId

  const respuesta = await fetch(`${URL_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const { valido, datos } = await leerJsonSeguro(respuesta)

  if (!respuesta.ok) {
    const mensaje = valido && datos ? (datos.message || datos.error) : null
    throw new Error(mensaje || 'Ocurrió un error al iniciar sesión.')
  }

  if (!valido || !datos || typeof datos !== 'object') {
    throw new Error('La respuesta del servidor no es válida.')
  }

  const token = typeof datos.token === 'string' ? datos.token.trim() : ''
  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('No se recibió un token de sesión válido.')
  }

  if (datos.usuario && datos.usuario.rol != null && datos.usuario.rol !== 'admin') {
    throw new Error('Acceso denegado: la cuenta no tiene rol de administrador.')
  }

  if (loginId !== ultimoLoginId) {
    return
  }

  try {
    sessionStorage.setItem('token', token)
  } catch {
    throw new Error('No se pudo guardar la sesión en el almacenamiento del navegador.')
  }
}

export async function obtenerUsuario() {
  const token = obtenerSesion()
  if (!token) return null

  const respuesta = await fetch(`${URL_BASE}/auth/usuario`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const { valido, datos } = await leerJsonSeguro(respuesta)

  if (!respuesta.ok) {
    cerrarSesion()
    const mensaje = valido && datos ? (datos.error || datos.message) : null
    const error = new Error(mensaje || 'Sesión inválida o expirada.')
    error.status = respuesta.status
    throw error
  }

  if (
    !valido ||
    !datos ||
    typeof datos !== 'object' ||
    Array.isArray(datos) ||
    datos.id == null ||
    (datos.rol != null && datos.rol !== 'admin')
  ) {
    cerrarSesion()
    const error = new Error('Sesión de usuario inválida.')
    error.status = 401
    throw error
  }

  return datos
}

export function obtenerSesion() {
  try {
    const token = sessionStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') return null
    return token
  } catch {
    return null
  }
}

export async function protegerRuta() {
  const token = obtenerSesion()
  if (!token) {
    throw redirect('/login')
  }

  try {
    await obtenerUsuario()
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      cerrarSesion()
      throw redirect('/login')
    }
    throw error
  }

  return token
}

export function cerrarSesion() {
  try {
    sessionStorage.removeItem('token')
  } catch {
    // Ignora errores si el almacenamiento no está disponible
  }
}

export function redirigirSiHaySesion() {
  const token = obtenerSesion()
  if (!token) return null

  if (!esJwtValidoYNoExpirado(token)) {
    cerrarSesion()
    return null
  }

  throw redirect('/administrador')
}