
import { pedir } from './ordenesCompraService'

const URL_BASE = import.meta.env.API_URL

export function obtenerLotes() {
  return pedir(`${URL_BASE}/lotes`)
}

export function actualizarFechaVencimiento(idLote, fechaVencimiento) {
  return pedir(`${URL_BASE}/lotes/${idLote}`, {
    method: 'PUT',
    body: JSON.stringify({ fechaVencimiento }),
  })
}
