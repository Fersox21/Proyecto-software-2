import { redirect } from 'react-router'

const URL_BASE = '/backend/data'
const CLAVE_SESION = 'admin:sesion'

  export async function iniciarSesion(password) {
  const respuesta = await fetch(`${URL_BASE}/credenciales.json`)
  if (!respuesta.ok) {
    throw new Error('No se pudo verificar el usuario. Intentá más tarde.')
  }

  const usuarios = await respuesta.json()
  const usuario = usuarios.find(
    (u) => u.password === password,
  )
  if (!usuario) {
    throw new Error('Email o contraseña incorrectos.')
  }


  const sesion = {}
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  return sesion
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
  return sesion // lo recibe LayoutGestor con useLoaderData()
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION)
}

export function redirigirSiHaySesion() {
  if (obtenerSesion()) {
    throw redirect('/gestor')
  }
  return null
}