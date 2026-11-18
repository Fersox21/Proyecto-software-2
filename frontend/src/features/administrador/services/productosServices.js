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

export async function obtenerProductos() {
  const respuesta = await fetch(`${URL_BASE}/productos`, {
    headers: headers()
  })
  
  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudieron obtener los productos')
  }
  
  return respuesta.json()
}

export async function obtenerHistorialProductos() {
  const respuesta = await fetch(`${URL_BASE}/productos/historial`, {
    headers: headers()
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudo obtener el historial de productos')
  }

  return respuesta.json()
}

export async function obtenerProductoPorId(id) {
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    headers: headers()
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'El producto que buscás no existe')
  }

  return respuesta.json()
}

export async function crearProducto(datos) {
  const esFormData = datos instanceof FormData
  const respuesta = await fetch(`${URL_BASE}/productos`, {
    method: 'POST',
    headers: headers(!esFormData),
    body: esFormData ? datos : JSON.stringify(datos)
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudo crear el producto')
  }

  return respuesta.json()
}

export async function actualizarProducto(id, datos) {
  const esFormData = datos instanceof FormData
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    method: 'PUT',
    headers: headers(!esFormData),
    body: esFormData ? datos : JSON.stringify(datos)
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudo actualizar el producto')
  }

  return respuesta.json()
}

export async function eliminarProducto(id) {
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    method: 'DELETE',
    headers: headers()
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudo eliminar el producto')
  }

  return true
}

export async function obtenerDestacados() {
  const productos = await obtenerProductos()
  return productos.filter((p) => p.destacado)
}

export async function obtenerCategorias() {
  const respuesta = await fetch(`${URL_BASE}/categorias`, {
    headers: headers()
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudieron obtener las categorías')
  }

  return respuesta.json()
}
