import { pedirAdmin, URL_BASE } from './httpAdmin'

export function obtenerPedidos() {
  return pedirAdmin(`${URL_BASE}/pedidos`, { method: 'GET' }, 'No se pudieron obtener los pedidos')
}

export function obtenerHistorialPedidos() {
  return pedirAdmin(
    `${URL_BASE}/pedidos/historial`,
    { method: 'GET' },
    'No se pudo obtener el historial de pedidos',
  )
}

export function obtenerPedidoPorId(id, { historial = false } = {}) {
  const query = historial ? '?historial=true' : ''
  return pedirAdmin(
    `${URL_BASE}/pedidos/${id}${query}`,
    { method: 'GET' },
    'No se pudo obtener el detalle del pedido',
  )
}

export function cancelarPedido(id, motivoRechazo) {
  return pedirAdmin(
    `${URL_BASE}/pedidos/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        estado: 'rechazado',
        motivoRechazo,
      }),
    },
    'No se pudo cancelar el pedido',
  )
}

export function modificarTotalPedido(id, { totalModificado, motivoModificacion }) {
  return pedirAdmin(
    `${URL_BASE}/pedidos/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        totalModificado,
        motivoModificacion,
      }),
    },
    'No se pudo modificar el total del pedido',
  )
}

export function obtenerLotesDisponibles(id) {
  return pedirAdmin(
    `${URL_BASE}/pedidos/${id}/lotes-disponibles`,
    { method: 'GET' },
    'No se pudieron obtener los lotes disponibles para el pedido',
  )
}

export function aceptarPedido(id, datosModificacion = null, asignacionesLotes = null) {
  const payload = {
    estado: 'aprobado',
  }

  if (datosModificacion && datosModificacion.totalModificado != null) {
    payload.totalModificado = datosModificacion.totalModificado
    payload.motivoModificacion = datosModificacion.motivoModificacion
  }

  if (Array.isArray(asignacionesLotes)) {
    payload.asignacionesLotes = asignacionesLotes
  }

  return pedirAdmin(
    `${URL_BASE}/pedidos/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    'No se pudo aceptar el pedido',
  )
}