const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers() {
  return {
    'Content-Type': 'application/json',
  }
}

async function procesarRespuesta(respuesta, mensajeErrorPorDefecto) {
  const texto = await respuesta.text()
  let datos = null
  if (texto) {
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = null
    }
  }

  if (!respuesta.ok) {
    const mensaje = datos?.error || datos?.message || mensajeErrorPorDefecto
    throw new Error(mensaje)
  }

  return datos
}

export async function crearPedido(pedido) {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(pedido)
  })

  return procesarRespuesta(respuesta, 'No se pudo registrar el pedido')
}
