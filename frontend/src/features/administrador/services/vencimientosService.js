import { pedir } from './ordenesCompraService'

const URL_BASE = import.meta.env.VITE_API_URL

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export function obtenerLotes() {
  return pedir(`${URL_BASE}/lotes`)
}

export function actualizarFechaVencimiento(idLote, fechaVencimiento) {
  return pedir(`${URL_BASE}/lotes/${idLote}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ fechaVencimiento }),
  })
}
