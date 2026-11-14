
const URL_BASE = import.meta.env.VITE_API_URL
async function leerCuerpo(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return null

  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

function mensajeDeError(estado, cuerpo) {
  if (cuerpo && typeof cuerpo === 'object') {
    if (typeof cuerpo.mensaje === 'string' && cuerpo.mensaje) return cuerpo.mensaje
    if (typeof cuerpo.error === 'string' && cuerpo.error) return cuerpo.error
  }

  if (estado === 400) return 'Los datos de la orden de compra no son válidos'
  if (estado === 404) return 'La orden de compra no existe'
  if (estado === 500) return 'El servidor no pudo procesar la solicitud'
  return 'No se pudo completar la operación'
}

export async function pedir(url, opciones = {}) {
  let respuesta

  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  if (respuesta.status === 204) return null

  const cuerpo = await leerCuerpo(respuesta)

  if (!respuesta.ok) {
    throw new Error(mensajeDeError(respuesta.status, cuerpo))
  }

  return cuerpo
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
