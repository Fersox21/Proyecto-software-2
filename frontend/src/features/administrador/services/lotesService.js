import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerLotes() {
  return pedirAdmin(`${URL_BASE}/lotes`)
}

export function obtenerHistorialLotes() {
  return pedirAdmin(`${URL_BASE}/lotes/historial`)
}

export function obtenerLotePorId(id) {
  return pedirAdmin(`${URL_BASE}/lotes/${id}`)
}

export function crearLote(datos) {
  return pedirAdmin(`${URL_BASE}/lotes`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarLote(id, datos) {
  return pedirAdmin(`${URL_BASE}/lotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarLote(id) {
  return pedirAdmin(`${URL_BASE}/lotes/${id}`, { method: 'DELETE' })
}

export function obtenerProductos() {
  return pedirAdmin(`${URL_BASE}/productos`)
}

export function obtenerOrdenesCompra() {
  return pedirAdmin(`${URL_BASE}/ordenesCompra`)
}

export function obtenerProveedores() {
  return pedirAdmin(`${URL_BASE}/proveedores`)
}

export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}