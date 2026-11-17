import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerProductos() {
  return pedirAdmin(`${URL_BASE}/productos`, { method: 'GET' }, 'No se pudieron obtener los productos')
}

export function obtenerHistorialProductos() {
  return pedirAdmin(
    `${URL_BASE}/productos/historial`,
    { method: 'GET' },
    'No se pudo obtener el historial de productos',
  )
}

export function obtenerProductoPorId(id) {
  return pedirAdmin(`${URL_BASE}/productos/${id}`, { method: 'GET' }, 'El producto que buscás no existe')
}

export function crearProducto(datos) {
  const esFormData = datos instanceof FormData
  return pedirAdmin(
    `${URL_BASE}/productos`,
    {
      method: 'POST',
      body: esFormData ? datos : JSON.stringify(datos),
    },
    'No se pudo crear el producto',
  )
}

export function actualizarProducto(id, datos) {
  const esFormData = datos instanceof FormData
  return pedirAdmin(
    `${URL_BASE}/productos/${id}`,
    {
      method: 'PUT',
      body: esFormData ? datos : JSON.stringify(datos),
    },
    'No se pudo actualizar el producto',
  )
}

export async function eliminarProducto(id) {
  await pedirAdmin(
    `${URL_BASE}/productos/${id}`,
    { method: 'DELETE' },
    'No se pudo eliminar el producto',
  )
  return true
}

export async function obtenerDestacados() {
  const productos = await obtenerProductos()
  return productos.filter((p) => p.destacado)
}

export function obtenerCategorias() {
  return pedirAdmin(`${URL_BASE}/categorias`, { method: 'GET' }, 'No se pudieron obtener las categorías')
}

export function obtenerTiposPromocion() {
  return pedirAdmin(
    `${URL_BASE}/tipos-promocion`,
    { method: 'GET' },
    'No se pudieron obtener los tipos de promoción',
  )
}
