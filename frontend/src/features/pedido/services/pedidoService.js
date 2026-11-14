const URL_BASE = import.meta.env.VITE_API_URL

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
      throw new Error('No autorizado: necesitás iniciar sesión para registrar el pedido')
    }

    let errorData = null
    try {
      errorData = await respuesta.json()
    } catch {
      // Ignora error de parseo si la respuesta no es JSON
    }

    const mensaje = errorData?.error || errorData?.message || mensajeErrorPorDefecto
    throw new Error(mensaje)
  }

  return respuesta.json()
}

export async function crearPedido(pedido) {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(pedido)
  })

  return procesarRespuesta(respuesta, 'No se pudo registrar el pedido')
}
