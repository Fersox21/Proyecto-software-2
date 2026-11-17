const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

async function procesarRespuesta(respuesta, mensajeErrorPorDefecto) {
  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Sesión inválida o expirada')
    }
    let errorData = null
    try {
      errorData = await respuesta.json()
    } catch {
      // Ignora error de parseo si no es JSON
    }
    const mensaje = errorData?.error || errorData?.message || mensajeErrorPorDefecto
    throw new Error(mensaje)
  }
  return respuesta.json()
}

export async function obtenerPedidos() {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'GET',
    headers: headers()
  })

  return procesarRespuesta(respuesta, 'No se pudieron obtener los pedidos')
}

export async function obtenerPedidoPorId(id) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'GET',
    headers: headers()
  })

  return procesarRespuesta(respuesta, 'No se pudo obtener el detalle del pedido')
}

export async function cancelarPedido(id, motivoRechazo) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      estado: 'cancelado',
      motivoRechazo
    })
  })

  return procesarRespuesta(respuesta, 'No se pudo cancelar el pedido')
}

export async function modificarTotalPedido(id, { totalModificado, motivoModificacion }) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      totalModificado,
      motivoModificacion
    })
  })

  return procesarRespuesta(respuesta, 'No se pudo modificar el total del pedido')
}

export async function obtenerLotesDisponibles(id) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}/lotes-disponibles`, {
    method: 'GET',
    headers: headers()
  })

  return procesarRespuesta(respuesta, 'No se pudieron obtener los lotes disponibles para el pedido')
}

export async function aceptarPedido(id, datosModificacion = null, asignacionesLotes = null) {
  const payload = {
    estado: 'aceptado'
  }

  if (datosModificacion && datosModificacion.totalModificado != null) {
    payload.totalModificado = datosModificacion.totalModificado
    payload.motivoModificacion = datosModificacion.motivoModificacion
  }

  if (Array.isArray(asignacionesLotes)) {
    payload.asignacionesLotes = asignacionesLotes
  }

  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(payload)
  })

  return procesarRespuesta(respuesta, 'No se pudo aceptar el pedido')
}