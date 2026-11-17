import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerVentas() {
  return pedirAdmin(`${URL_BASE}/ventas`, { method: 'GET' }, 'No se pudieron obtener las ventas')
}

export function obtenerHistorialVentas() {
  return pedirAdmin(
    `${URL_BASE}/ventas/historial`,
    { method: 'GET' },
    'No se pudo obtener el historial de ventas',
  )
}

export function obtenerVentasUltimoMes() {
  return pedirAdmin(
    `${URL_BASE}/ventas?periodo=ultimo-mes`,
    { method: 'GET' },
    'No se pudieron obtener las ventas del último mes',
  )
}

export function obtenerVentaPorId(id, { historial = false } = {}) {
  const query = historial ? '?historial=true' : ''
  return pedirAdmin(
    `${URL_BASE}/ventas/${id}${query}`,
    { method: 'GET' },
    'No se pudo obtener el detalle de la venta',
  )
}

export function obtenerProductosVenta(id, { historial = false } = {}) {
  const query = historial ? '?historial=true' : ''
  return pedirAdmin(
    `${URL_BASE}/ventas/${id}/productos${query}`,
    { method: 'GET' },
    'No se pudieron obtener los productos de la venta',
  )
}

export function actualizarVenta(id, datos) {
  return pedirAdmin(
    `${URL_BASE}/ventas/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(datos),
    },
    'No se pudo actualizar la venta',
  )
}

export function eliminarVenta(id) {
  return pedirAdmin(
    `${URL_BASE}/ventas/${id}`,
    { method: 'DELETE' },
    'No se pudo eliminar la venta',
  )
}
