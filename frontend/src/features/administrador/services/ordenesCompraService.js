const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers(conJson = true) {
  const token = sessionStorage.getItem('token')
  const base = {
    'Authorization': `Bearer ${token}`
  }
  if (conJson) {
    base['Content-Type'] = 'application/json'
  }
  return base
}

export async function pedir(url, opciones = {}) {
  const esFormData = opciones.body instanceof FormData
  let respuesta

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: {
        ...headers(!esFormData),
        ...(opciones.headers ?? {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }

  if (respuesta.status === 204) return null

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    const mensaje = datos?.error || datos?.mensaje || 'No se pudo completar la operación'
    throw new Error(mensaje)
  }

  return datos
}

export function obtenerOrdenesCompra() {
  return pedir(`${URL_BASE}/ordenesCompra`)
}

export function obtenerOrdenCompraPorId(id) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`)
}

function asegurarFormData(datos) {
  if (datos instanceof FormData) return datos
  const formData = new FormData()
  formData.append('datos', JSON.stringify(datos))
  return formData
}

export function crearOrdenCompra(datos) {
  return pedir(`${URL_BASE}/ordenesCompra`, {
    method: 'POST',
    body: asegurarFormData(datos),
  })
}

export function actualizarOrdenCompra(id, datos) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`, {
    method: 'PUT',
    body: asegurarFormData(datos),
  })
}

export function eliminarOrdenCompra(id) {
  return pedir(`${URL_BASE}/ordenesCompra/${id}`, { method: 'DELETE' })
}

function filtrarActivos(datos) {
  return Array.isArray(datos) ? datos.filter((item) => item?.activo !== false) : []
}

export function obtenerProveedores() {
  return pedir(`${URL_BASE}/proveedores`).then(filtrarActivos)
}

export function crearProveedor({ nombre, telefono }) {
  return pedir(`${URL_BASE}/proveedores`, {
    method: 'POST',
    body: JSON.stringify({ nombre, telefono }),
  })
}

export function obtenerProductos() {
  return pedir(`${URL_BASE}/productos`).then(filtrarActivos)
}

export function obtenerCategorias() {
  return pedir(`${URL_BASE}/categorias`).then(filtrarActivos)
}

export function crearCategoria(nombre) {
  return pedir(`${URL_BASE}/categorias`, {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function obtenerTiposPromocion() {
  return pedir(`${URL_BASE}/tipos-promocion`).then(filtrarActivos)
}

export function crearTipoPromocion(nombre) {
  return pedir(`${URL_BASE}/tipos-promocion`, {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function normalizarFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}