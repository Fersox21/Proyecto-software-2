import { pedirAdmin, URL_BASE } from './httpAdmin'

export { pedirAdmin as pedir }

export function obtenerProveedores() {
  return pedirAdmin(`${URL_BASE}/proveedores`)
}

export function obtenerProveedorPorId(id) {
  return pedirAdmin(`${URL_BASE}/proveedores/${id}`)
}

export function crearProveedor(datos) {
  return pedirAdmin(`${URL_BASE}/proveedores`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarProveedor(id, datos) {
  return pedirAdmin(`${URL_BASE}/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarProveedor(id) {
  return pedirAdmin(`${URL_BASE}/proveedores/${id}`, { method: 'DELETE' })
}