import { redirect } from 'react-router'

const URL_BASE = '/data/credenciales.json' 
const CLAVE_SESION = 'admin:sesion'

export async function iniciarSesion({ email, password }) {
  // 1. Petición GET para obtener las credenciales desde el JSON estático
  const respuesta = await fetch(URL_BASE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!respuesta.ok) {
    throw new Error('No se pudo cargar la base de datos de credenciales.')
  }

  const usuarios = await respuesta.json()

  const usuarioEncontrado = usuarios.find(
    (u) => u.email === email && u.password === password
  )

  if (!usuarioEncontrado) {
    throw new Error('Email o contraseña incorrectos.')
  }

  const { password: _, ...datosUsuario } = usuarioEncontrado

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datosUsuario))
  return datosUsuario
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