import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerCategorias() {
  return pedirAdmin(`${URL_BASE}/categorias`)
}

export function crearCategoria(datos) {
  return pedirAdmin(`${URL_BASE}/categorias`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarCategoria(id, datos) {
  return pedirAdmin(`${URL_BASE}/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarCategoria(id) {
  return pedirAdmin(`${URL_BASE}/categorias/${id}`, {
    method: 'DELETE',
  })
}
