// Funciones puras: reciben un valor y devuelven otro, sin estado ni marcado.

export function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)
}

// Una promo es válida solo si el flag está activo y el precio promocional es
// numérico, mayor a 0 y menor al precio de venta. Misma regla que el backend
// (backend/src/modules/productos/productos.precio.js), sin redondeos.
export function esPromoValida(precioVenta, precioPromo, enPromocion) {
  if (!enPromocion) return false

  const normal = Number(precioVenta)
  const promo = Number(precioPromo)

  if (!Number.isFinite(normal) || !Number.isFinite(promo)) return false

  return normal > 0 && promo > 0 && promo < normal
}

// Porcentaje entero de descuento para mostrar en el badge (entre 1 y 99).
export function calcularDescuento(precioVenta, precioPromo) {
  if (!esPromoValida(precioVenta, precioPromo, true)) return 0

  const normal = Number(precioVenta)
  const promo = Number(precioPromo)
  const porcentaje = ((normal - promo) / normal) * 100

  return Math.min(99, Math.max(1, Math.round(porcentaje)))
}

// Precio unitario vigente de un producto (promoción incluida).
export function precioVigente(producto = {}) {
  const normal = Number(producto?.precioVenta)
  const promo = Number(producto?.precioPromo)

  if (esPromoValida(normal, promo, producto?.enPromocion)) return promo

  return Number.isFinite(normal) ? normal : 0
}

// Datos de precio listos para renderizar: una única fuente de verdad para
// tarjeta, detalle, carrito y checkout.
export function obtenerPreciosProducto(producto = {}) {
  const precioNormal = Number(producto?.precioVenta)
  const precioPromo = Number(producto?.precioPromo)
  const enPromocion = esPromoValida(precioNormal, precioPromo, producto?.enPromocion)

  return {
    precioNormal,
    precioPromo,
    enPromocion,
    descuento: enPromocion ? calcularDescuento(precioNormal, precioPromo) : 0,
    precioVigente: enPromocion ? precioPromo : (Number.isFinite(precioNormal) ? precioNormal : 0),
  }
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
