import { pedirAdmin, URL_BASE } from './httpAdmin'

export { pedirAdmin as pedir }

export function obtenerOrdenesCompra() {
  return pedirAdmin(`${URL_BASE}/ordenesCompra`)
}

export function obtenerHistorialOrdenesCompra() {
  return pedirAdmin(`${URL_BASE}/ordenesCompra/historial`)
}

export function obtenerOrdenCompraPorId(id, { historial = false } = {}) {
  const query = historial ? '?historial=true' : ''
  return pedirAdmin(`${URL_BASE}/ordenesCompra/${id}${query}`)
}

function asegurarFormData(datos) {
  if (datos instanceof FormData) return datos
  const formData = new FormData()
  formData.append('datos', JSON.stringify(datos))
  return formData
}

export function crearOrdenCompra(datos) {
  return pedirAdmin(`${URL_BASE}/ordenesCompra`, {
    method: 'POST',
    body: asegurarFormData(datos),
  })
}

export function actualizarOrdenCompra(id, datos) {
  return pedirAdmin(`${URL_BASE}/ordenesCompra/${id}`, {
    method: 'PUT',
    body: asegurarFormData(datos),
  })
}

export function eliminarOrdenCompra(id) {
  return pedirAdmin(`${URL_BASE}/ordenesCompra/${id}`, { method: 'DELETE' })
}

function filtrarActivos(datos) {
  return Array.isArray(datos) ? datos.filter((item) => item?.activo !== false) : []
}

export function obtenerProveedores() {
  return pedirAdmin(`${URL_BASE}/proveedores`).then(filtrarActivos)
}

export function crearProveedor({ nombre, telefono }) {
  return pedirAdmin(`${URL_BASE}/proveedores`, {
    method: 'POST',
    body: JSON.stringify({ nombre, telefono }),
  })
}

export function obtenerProductos() {
  return pedirAdmin(`${URL_BASE}/productos`).then(filtrarActivos)
}

export function obtenerCategorias() {
  return pedirAdmin(`${URL_BASE}/categorias`).then(filtrarActivos)
}

export function crearCategoria(nombre) {
  return pedirAdmin(`${URL_BASE}/categorias`, {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function obtenerTiposPromocion() {
  return pedirAdmin(`${URL_BASE}/tipos-promocion`).then(filtrarActivos)
}

export function crearTipoPromocion(nombre) {
  return pedirAdmin(`${URL_BASE}/tipos-promocion`, {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}