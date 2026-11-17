const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function headers() {
  const token = sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

async function pedir(url, opciones = {}) {
  let respuesta

  try {
    respuesta = await fetch(url, {
      ...opciones,
      headers: {
        ...headers(),
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

export function obtenerCategorias() {
  return pedir(`${URL_BASE}/categorias`)
}

export function crearCategoria(datos) {
  return pedir(`${URL_BASE}/categorias`, {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function actualizarCategoria(id, datos) {
  return pedir(`${URL_BASE}/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
}

export function eliminarCategoria(id) {
  return pedir(`${URL_BASE}/categorias/${id}`, {
    method: 'DELETE',
  })
}
