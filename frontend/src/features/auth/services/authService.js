import { redirect } from 'react-router'

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function iniciarSesion({ email, password }) {

  const respuesta = await fetch(`${URL_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })



  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.message || datos.error || 'Ocurrió un error al iniciar sesión.')
  }

  sessionStorage.setItem('token', datos.token)

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

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    cerrarSesion()
    
    const error = new Error(datos.error || 'Sesión inválida o expirada.')
    error.status = respuesta.status
    throw error
  }

  return datos
}

export function obtenerSesion() {
  try {
    return sessionStorage.getItem('token')
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
    // Fallo de red o error del servidor: propagar al errorElement
    throw error
  }

  return token
}

export function cerrarSesion() {
  sessionStorage.removeItem('token')
}

export function redirigirSiHaySesion() {
  if (obtenerSesion()) {
    throw redirect('/administrador')
  }
  return null
}