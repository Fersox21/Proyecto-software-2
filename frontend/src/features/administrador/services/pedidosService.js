const URL_BASE = 'http://localhost:3000'

export async function obtenerPedidos() {
  const respuesta = await fetch(`${URL_BASE}/api/pedidos`)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los pedidos')
  }

  return respuesta.json()
}