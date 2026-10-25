import { redirect } from 'react-router'

const URL_BASE = 'http://localhost:3000' 
const CLAVE_SESION = 'admin:sesion'

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
    throw new Error(datos.error || datos.mensaje || 'Email o contraseña incorrectos.')
  }

  sessionStorage.setItem(CLAVE_SESION, datos.token)
  return datos.token
}

export function obtenerSesion() {
  try {
    return sessionStorage.getItem(CLAVE_SESION)
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
  sessionStorage.removeItem(CLAVE_SESION)
}

export function redirigirSiHaySesion() {
  if (obtenerSesion()) {
    throw redirect('/administrador')
  }
  return null
}