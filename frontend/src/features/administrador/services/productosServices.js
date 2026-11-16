const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
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
  const respuesta = await fetch(`${URL_BASE}/productos`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(datos)
  })

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}))
    throw new Error(errorData.error || 'No se pudo crear el producto')
  }

  return respuesta.json()
}

export async function actualizarProducto(id, datos) {
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(datos)
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
