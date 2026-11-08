// Lotes: backend Node (puerto 3000). El módulo ya expone el CRUD completo y
// permite dar de baja de forma lógica (activo = false).
// Productos, órdenes de compra y proveedores también se piden a Node para
// resolver los selects del formulario.

const URL_LOTES = 'http://localhost:3000/api/lotes'
const URL_PRODUCTOS = 'http://localhost:3000/api/productos'
const URL_ORDENES = 'http://localhost:3000/api/ordenesCompra'
const URL_PROVEEDORES = 'http://localhost:3000/api/proveedores'

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
    if (typeof cuerpo.error === 'string' && cuerpo.error) return cuerpo.error
    if (typeof cuerpo.message === 'string' && cuerpo.message) return cuerpo.message
    if (typeof cuerpo.mensaje === 'string' && cuerpo.mensaje) return cuerpo.mensaje
  }

  if (estado === 400) return 'Los datos del lote no son válidos'
  if (estado === 401) return 'No autorizado: iniciá sesión nuevamente'
  if (estado === 404) return 'El lote no existe'
  if (estado === 500) return 'El servidor no pudo procesar la solicitud'
  return 'No se pudo completar la operación'
}

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

  const cuerpo = await leerCuerpo(respuesta)

  if (!respuesta.ok) {
    throw new Error(mensajeDeError(respuesta.status, cuerpo))
  }

  return cuerpo
}

export function obtenerLotes() {
  return pedir(URL_LOTES)
}

export function obtenerLotePorId(id) {
  return pedir(`${URL_LOTES}/${id}`)
}

export function crearLote(datos) {
  return pedir(URL_LOTES, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarLote(id, datos) {
  return pedir(`${URL_LOTES}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarLote(id) {
  return pedir(`${URL_LOTES}/${id}`, { method: 'DELETE' })
}

export function obtenerProductos() {
  return pedir(URL_PRODUCTOS)
}

export function obtenerOrdenesCompra() {
  return pedir(URL_ORDENES)
}

export function obtenerProveedores() {
  return pedir(URL_PROVEEDORES)
}

// pg serializa las columnas DATE como ISO completo; los <input type="date">
// solo aceptan los primeros 10 caracteres (YYYY-MM-DD).
export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}
