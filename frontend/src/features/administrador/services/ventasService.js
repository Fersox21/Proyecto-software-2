const URL_BASE = '/public'

export async function obtenerVentas() {
  const respuesta = await fetch(`${URL_BASE}/ventas.json`)
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las ventas')
  }
  return respuesta.json()
}