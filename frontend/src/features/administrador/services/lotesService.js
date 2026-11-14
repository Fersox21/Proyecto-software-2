const URL_BASE = import.meta.env.VITE_API_URL

function obtenerToken() {
  try {
    return sessionStorage.getItem('token')
  } catch {
    return null
  }
}

async function pedir(url, opciones = {}) {
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

export function obtenerLotes() {
  return pedir(`${URL_BASE}/lotes`)
}

export function obtenerLotePorId(id) {
  return pedir(`${URL_BASE}/lotes/${id}`)
}

export function crearLote(datos) {
  return pedir(`${URL_BASE}/lotes`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarLote(id, datos) {
  return pedir(`${URL_BASE}/lotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarLote(id) {
  return pedir(`${URL_BASE}/lotes/${id}`, { method: 'DELETE' })
}

export function obtenerProductos() {
  return pedir(`${URL_BASE}/productos`)
}

export function obtenerOrdenesCompra() {
  return pedir(`${URL_BASE}/ordenesCompra`)
}

export function obtenerProveedores() {
  return pedir(`${URL_BASE}/proveedores`)
}

export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}
