const URL_BASE = 'http://localhost:3000' /* Poner puerto 3000 para backend node y puerto 8081 para springboot */

export async function obtenerProductos() {
  const respuesta = await fetch(`${URL_BASE}/api/productos`)
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
