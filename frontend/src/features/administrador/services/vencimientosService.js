// Lotes y vencimientos: backend Java (Spring Boot, puerto 8081).
// El endpoint /api/lotes devuelve cada lote con su producto, su orden de compra
// y el proveedor, así la vista no necesita pedir una orden por cada lote.

import { pedir } from './ordenesCompraService'

const URL_LOTES = 'http://localhost:8081/api/lotes'

export function obtenerLotes() {
  return pedir(URL_LOTES)
}

export function actualizarFechaVencimiento(idLote, fechaVencimiento) {
  return pedir(`${URL_LOTES}/${idLote}`, {
    method: 'PUT',
    body: JSON.stringify({ fechaVencimiento }),
  })
}
