const URL_BASE = 'http://localhost:3000' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

async function get(path) {
  const token = sessionStorage.getItem('token')
  const respuesta = await fetch(`${URL_BASE}/api/estadisticas${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    if (respuesta.status === 400) {
      const cuerpo = await respuesta.json().catch(() => null)
      throw new Error(cuerpo?.error || 'Parámetros inválidos')
    }
    throw new Error('No se pudieron obtener las estadísticas')
  }

  return respuesta.json()
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
