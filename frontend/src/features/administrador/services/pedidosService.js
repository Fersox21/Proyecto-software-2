const URL_BASE = 'http://localhost:3000' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

export async function obtenerPedidos() {
  const respuesta = await fetch(`${URL_BASE}/api/pedidos`)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los pedidos')
  }

  return respuesta.json()
}