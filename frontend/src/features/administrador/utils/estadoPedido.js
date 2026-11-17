const ESTADOS_PENDIENTE = new Set(['pendiente', 'en_proceso', 'nuevo'])
const ESTADOS_APROBADO = new Set(['aprobado', 'completado', 'entregado', 'confirmado', 'aceptado'])
const ESTADOS_CANCELADO = new Set(['rechazado', 'cancelado', 'anulado'])

export function obtenerClaseEstadoChip(estado) {
  const normalizado = (estado || '').toLowerCase().trim()
  if (ESTADOS_PENDIENTE.has(normalizado)) return 'pedido-estado-pendiente'
  if (ESTADOS_APROBADO.has(normalizado)) return 'pedido-estado-aprobado'
  if (ESTADOS_CANCELADO.has(normalizado)) return 'pedido-estado-cancelado'
  return 'pedido-estado-neutro'
}
