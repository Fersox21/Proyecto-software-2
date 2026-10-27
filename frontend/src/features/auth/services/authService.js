import { redirect } from 'react-router'

const URL_BASE = 'http://localhost:3000' 

export async function iniciarSesion({ email, password }) {

  const respuesta = await fetch(`${URL_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })



  const datos = await respuesta.json()

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error al iniciar sesión.')
  }

  sessionStorage.setItem('token', datos.token)

}

export async function obtenerUsuario() {
  const token = obtenerSesion()
  if (!token) return null

  const respuesta = await fetch(`${URL_BASE}/api/auth/usuario`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const datos = await respuesta.json()

  if (!respuesta.ok) {
    cerrarSesion()
    throw new Error(datos.error || 'Sesión inválida o expirada.')
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

export function protegerRuta() {
  const token = obtenerSesion()
  if (!token) {
    throw redirect('/login')
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