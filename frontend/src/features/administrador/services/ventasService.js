const URL_BASE = 'http://localhost:8081' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

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

export async function obtenerProductosVenta(id) {
  const respuesta = await fetch(`${URL_BASE}/api/ventas/${id}/productos`, {
    headers: headers()
  })
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los productos de la venta')
  }
  return respuesta.json()
}

export async function actualizarVenta(id, datos) {
  const respuesta = await fetch(`${URL_BASE}/api/ventas/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(datos)
  })
  if (!respuesta.ok) {
    throw new Error('No se pudo actualizar la venta')
  }
}

export async function eliminarVenta(id) {
  const respuesta = await fetch(`${URL_BASE}/api/ventas/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar la venta')
  }
}
