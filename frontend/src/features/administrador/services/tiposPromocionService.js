import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerTiposPromocion() {
  return pedirAdmin(`${URL_BASE}/tipos-promocion`)
}

export function crearTipoPromocion(datos) {
  return pedirAdmin(`${URL_BASE}/tipos-promocion`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarTipoPromocion(id, datos) {
  return pedirAdmin(`${URL_BASE}/tipos-promocion/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarTipoPromocion(id) {
  return pedirAdmin(`${URL_BASE}/tipos-promocion/${id}`, {
    method: 'DELETE',
  })
}
