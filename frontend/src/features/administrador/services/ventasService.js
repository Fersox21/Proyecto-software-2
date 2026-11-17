const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function obtenerVentas() {
  const respuesta = await fetch(`${URL_BASE}/ventas`, {
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

export async function obtenerHistorialVentas() {
  const respuesta = await fetch(`${URL_BASE}/ventas/historial`, {
    headers: headers()
  })
  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    throw new Error('No se pudo obtener el historial de ventas')
  }
  return respuesta.json()
}


export async function obtenerVentasUltimoMes() {
  const respuesta = await fetch(`${URL_BASE}/ventas?periodo=ultimo-mes`, {
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

async function procesarRespuesta(respuesta, mensajeErrorPorDefecto) {
  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    let errorData = null
    try {
      errorData = await respuesta.json()
    } catch {
      // Sin cuerpo JSON
    }
    const mensaje = errorData?.error || errorData?.message || mensajeErrorPorDefecto
    throw new Error(mensaje)
  }
  if (respuesta.status === 204) return null
  return respuesta.json()
}

export async function obtenerVentaPorId(id) {
  const respuesta = await fetch(`${URL_BASE}/ventas/${id}`, {
    headers: headers()
  })
  return procesarRespuesta(respuesta, 'No se pudo obtener el detalle de la venta')
}

export async function obtenerProductosVenta(id) {
  const respuesta = await fetch(`${URL_BASE}/ventas/${id}/productos`, {
    headers: headers()
  })
  return procesarRespuesta(respuesta, 'No se pudieron obtener los productos de la venta')
}

export async function actualizarVenta(id, datos) {
  const respuesta = await fetch(`${URL_BASE}/ventas/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(datos)
  })
  return procesarRespuesta(respuesta, 'No se pudo actualizar la venta')
}

export async function eliminarVenta(id) {
  const respuesta = await fetch(`${URL_BASE}/ventas/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar la venta')
  }
}
