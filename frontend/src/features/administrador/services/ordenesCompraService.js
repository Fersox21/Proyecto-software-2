const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function obtenerToken() {
  try {
    return sessionStorage.getItem('token')
  } catch {
    return null
  }
}

export async function pedir(url, opciones = {}) {
  const token = obtenerToken()
  let respuesta

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opciones.headers ?? {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const mensaje = datos?.error || datos?.mensaje || 'No se pudo completar la operación'
    throw new Error(mensaje)
  }

  return datos
}

export function obtenerOrdenesCompra() {
  return pedir(`${URL_BASE}/ordenesCompra`)
}

export function obtenerOrdenCompraPorId(id) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`)
}

export function crearOrdenCompra(datos) {
  return pedir(`${URL_BASE}/ordenesCompra`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarOrdenCompra(id, datos) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarOrdenCompra(id) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`, { method: 'DELETE' })
}

export function obtenerProveedores() {
  return pedir(`${URL_BASE}/proveedores`)
}

export function obtenerProductos() {
  return pedir(`${URL_BASE}/productos`)
}

export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}
