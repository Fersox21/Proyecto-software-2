// Órdenes de compra: backend Java (Spring Boot, puerto 8081).
// Proveedores: backend Node (puerto 3000), porque el backend Java todavía no
// expone /api/proveedores.
// Productos: backend Java, endpoint /api/productos/admin.

const URL_ORDENES = 'http://localhost:8081/api/ordenesCompra'
const URL_PROVEEDORES = 'http://localhost:3000/api/proveedores'
const URL_PRODUCTOS = 'http://localhost:8081/api/productos/admin'

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
  return pedir(URL_ORDENES)
}

export function obtenerOrdenCompraPorId(id) {
  return pedir(`${URL_ORDENES}/${id}`)
}

export function crearOrdenCompra(datos) {
  return pedir(URL_ORDENES, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarOrdenCompra(id, datos) {
  return pedir(`${URL_ORDENES}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarOrdenCompra(id) {
  return pedir(`${URL_ORDENES}/${id}`, { method: 'DELETE' })
}

export function obtenerProveedores() {
  return pedir(URL_PROVEEDORES)
}

export function obtenerProductos() {
  return pedir(URL_PRODUCTOS)
}

// El backend serializa java.sql.Date: puede llegar "2026-11-03" o un ISO con
// hora. Para <input type="date"> solo sirven los primeros 10 caracteres.
export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}
