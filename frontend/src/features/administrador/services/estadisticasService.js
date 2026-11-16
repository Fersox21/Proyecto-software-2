const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function obtenerToken() {
  try {
    return sessionStorage.getItem('token')
  } catch {
    return null
  }
}

async function get(path) {
  const token = obtenerToken()
  const respuesta = await fetch(`${URL_BASE}/estadisticas${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => null)
    throw new Error(cuerpo?.error || cuerpo?.mensaje || 'No se pudieron obtener las estadísticas')
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
