import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerLotes() {
  return pedirAdmin(`${URL_BASE}/lotes`)
}

export function actualizarFechaVencimiento(idLote, fechaVencimiento) {
  return pedirAdmin(`${URL_BASE}/lotes/${idLote}`, {
    method: 'PUT',
    body: JSON.stringify({ fechaVencimiento }),
  })
}
