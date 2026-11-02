const URL_BASE = 'http://localhost:3000' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

export async function obtenerPedidos() {
  const token = sessionStorage.getItem('token')

  const respuesta = await fetch(`${URL_BASE}/api/pedidos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('No autorizado: Token inválido o expirado')
    }
    throw new Error('No se pudieron obtener los pedidos')
  }

  return respuesta.json()
}