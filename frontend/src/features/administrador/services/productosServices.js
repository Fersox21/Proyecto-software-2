const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export async function obtenerProductos() {
  const respuesta = await fetch(`${URL_BASE}/productos`)
  
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los productos')
  }
  
  return respuesta.json()
}

export async function obtenerProductoPorId(id) {
  const productos = await obtenerProductos()
  const producto = productos.find((p) => p.id === Number(id))
  if (!producto) {
    throw new Error('El producto que buscás no existe')
  }
  return producto
}

export async function obtenerDestacados() {
  const productos = await obtenerProductos()
  return productos.filter((p) => p.destacado)
}
