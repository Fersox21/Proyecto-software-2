import { redirect } from 'react-router'

const URL_BASE = 'http://localhost:3000' 
const CLAVE_SESION = 'admin:sesion'

export async function iniciarSesion({ email, password }) {
  const respuesta = await fetch(`${URL_BASE}/api/roles/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo: email, password }),
  })

  if (!respuesta.ok) {
    const datosError = await respuesta.json().catch(() => ({}))
    throw new Error(datosError.error || 'Correo o contraseña incorrectos.')
  }

  const usuario = await respuesta.json()

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(usuario))
  return {}
}

export function obtenerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION))
  } catch {
    return null
  }
}

export function protegerRuta() {
  const sesion = obtenerSesion()
  if (!sesion) {
    throw redirect('/login')
  }
  return sesion 
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