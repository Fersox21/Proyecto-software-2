import { pedirAdmin, URL_BASE } from './httpAdmin'

function get(path) {
  return pedirAdmin(
    `${URL_BASE}/estadisticas${path}`,
    { method: 'GET' },
    'No se pudieron obtener las estadísticas',
  )
}

export function obtenerGananciasMensuales() {
  return get('/ganancias-mensuales')
}

export function obtenerProductosVencidos() {
  return get('/productos-vencidos')
}

export function obtenerMasVendidos(mes) {
  const query = mes ? `?mes=${encodeURIComponent(mes)}` : ''
  return get(`/mas-vendidos${query}`)
}

export function obtenerPromedioDiario() {
  return get('/promedio-diario')
}