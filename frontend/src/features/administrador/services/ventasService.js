const URL_BASE = 'http://localhost:3000' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function obtenerVentas() {
  const respuesta = await fetch(`${URL_BASE}/api/ventas`, {
    headers: headers()
  })
  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    throw new Error('No se pudieron obtener las ventas')
  }
  return respuesta.json()
}

export async function obtenerVentasUltimoMes() {
  const respuesta = await fetch(`${URL_BASE}/api/ventas?periodo=ultimo-mes`, {
    headers: headers()
  })
  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    throw new Error('No se pudieron obtener las ventas del último mes')
  }
  return respuesta.json()
}
