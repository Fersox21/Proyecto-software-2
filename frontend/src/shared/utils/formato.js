// Funciones puras: reciben un valor y devuelven otro, sin estado ni marcado.

export function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatearFecha(fechaISO) {
  // El backend puede mandar "2026-11-03" o un ISO completo con hora. Se toman
  // los primeros 10 caracteres y se agrega la hora para que no se corra un día
  // por la zona horaria.
  const soloFecha = String(fechaISO ?? '').slice(0, 10)
  if (!soloFecha) return '—'

  return new Intl.DateTimeFormat('es-AR').format(new Date(`${soloFecha}T00:00:00`))
}

export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
