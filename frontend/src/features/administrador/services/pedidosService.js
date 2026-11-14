const URL_BASE = import.meta.env.VITE_API_URL
export async function obtenerPedidos() {
  const token = sessionStorage.getItem('token') // Ajusta la clave según tu app

  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
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