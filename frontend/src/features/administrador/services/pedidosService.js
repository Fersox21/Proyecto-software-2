const URL_BASE = import.meta.env.VITE_API_URL

function obtenerEncabezados() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
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
    headers: obtenerEncabezados()
  })

  return procesarRespuesta(respuesta, 'No se pudieron obtener los pedidos')
}

export async function obtenerPedidoPorId(id) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'GET',
    headers: obtenerEncabezados()
  })

  return procesarRespuesta(respuesta, `No se pudo obtener el detalle del pedido #${id}`)
}

export async function cancelarPedido(id, motivoRechazo) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: obtenerEncabezados(),
    body: JSON.stringify({
      estado: 'cancelado',
      motivoRechazo
    })
  })

  return procesarRespuesta(respuesta, `No se pudo cancelar el pedido #${id}`)
}

export async function aceptarPedido(id) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: obtenerEncabezados(),
    body: JSON.stringify({
      estado: 'aceptado'
    })
  })

  return procesarRespuesta(respuesta, `No se pudo aceptar el pedido #${id}`)
}
