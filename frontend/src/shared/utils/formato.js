// Funciones puras: reciben un valor y devuelven otro, sin estado ni marcado.

// Redondea a dos decimales evitando los errores de coma flotante.
export function redondear2(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return NaN
  return Math.round((numero + Number.EPSILON) * 100) / 100
}

// El descuento se expresa como un porcentaje entero (1% a 99%). El porcentaje se
// obtiene del precio de venta y del precio promocional guardado, y el precio se
// normaliza a centavos para que ambos números concuerden.
// Ejemplo: venta $900 y promo $800 => 11% => precio promocional $801.
export function porcentajeDescuento(precioVenta, precioPromo) {
  const normal = Number(precioVenta)
  const promo = Number(precioPromo)

  if (!Number.isFinite(normal) || !Number.isFinite(promo)) return null
  if (normal <= 0 || promo <= 0 || promo >= normal) return null

  const porcentaje = Math.round(((normal - promo) / normal) * 100)

  if (porcentaje < 1 || porcentaje > 99) return null

  return porcentaje
}

// Precio promocional exacto para un porcentaje entero de descuento.
export function precioConDescuento(precioVenta, porcentaje) {
  const normal = Number(precioVenta)
  const pct = Number(porcentaje)

  if (!Number.isFinite(normal) || !Number.isFinite(pct)) return NaN

  return redondear2(normal * (1 - pct / 100))
}

// Una promo es válida solo si el flag está activo y los precios representan un
// descuento entero de entre 1% y 99%.
export function esPromoValida(precioVenta, precioPromo, enPromocion) {
  if (!enPromocion) return false
  return porcentajeDescuento(precioVenta, precioPromo) !== null
}

// Porcentaje entero de descuento (1 a 99) o null si la promo no es válida.
export function calcularDescuento(precioVenta, precioPromo) {
  return porcentajeDescuento(precioVenta, precioPromo)
}

// Precio unitario vigente de un producto (promoción incluida y normalizada).
export function precioVigente(producto = {}) {
  return obtenerPreciosProducto(producto).precioVigente
}

// Datos de precio listos para renderizar: una única fuente de verdad para
// tarjeta, detalle, carrito y checkout.
export function obtenerPreciosProducto(producto = {}) {
  const precioNormal = Number(producto?.precioVenta)
  const precioPromoGuardado = Number(producto?.precioPromo)

  const descuento = esPromoValida(precioNormal, precioPromoGuardado, producto?.enPromocion)
    ? porcentajeDescuento(precioNormal, precioPromoGuardado)
    : null

  const precioPromo = descuento !== null
    ? precioConDescuento(precioNormal, descuento)
    : (Number.isFinite(precioPromoGuardado) ? precioPromoGuardado : null)

  const precioVigente = descuento !== null
    ? precioPromo
    : (Number.isFinite(precioNormal) ? precioNormal : 0)

  return {
    precioNormal,
    precioPromo,
    enPromocion: descuento !== null,
    descuento,
    ahorro: descuento !== null ? redondear2(precioNormal - precioPromo) : null,
    precioVigente,
  }
}

export function formatearPrecio(valor) {
  const numero = Number(valor)
  const precio = Number.isFinite(numero) ? numero : 0
  // Si el precio tiene centavos se muestran los dos decimales; si es entero se
  // mantiene el formato corto ("$900" en lugar de "$900,00").
  const tieneCentavos = Math.round(precio * 100) % 100 !== 0

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(precio)
}

export function formatearFecha(fechaISO) {
  // El backend puede mandar "2026-11-03" o un ISO completo con hora. Se toman
  // los primeros 10 caracteres y se agrega la hora para que no se corra un día
  // por la zona horaria.
  const soloFecha = String(fechaISO ?? '').slice(0, 10)
  if (!soloFecha) return '—'

  return new Intl.DateTimeFormat('es-AR').format(new Date(`${soloFecha}T00:00:00`))
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const BASE_BACKEND = API_URL.replace(/\/api\/?$/, '')

export const IMAGEN_PRODUCTO_DEFAULT =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Crect width='200' height='200' fill='%23F3F4F6'/%3E%3Crect x='55' y='55' width='90' height='90' rx='10' stroke='%23D1D5DB' stroke-width='4'/%3E%3Ccircle cx='82' cy='84' r='8' fill='%23D1D5DB'/%3E%3Cpath d='M65 130l24-24 18 18 12-12 16 18H65z' fill='%23D1D5DB'/%3E%3C/svg%3E"

export function obtenerUrlImagenProducto(imagen) {
  if (!imagen || typeof imagen !== 'string') return IMAGEN_PRODUCTO_DEFAULT
  const limpia = imagen.trim()
  if (!limpia) return IMAGEN_PRODUCTO_DEFAULT
  if (/^https?:\/\//i.test(limpia) || limpia.startsWith('blob:') || limpia.startsWith('data:')) {
    return limpia
  }
  if (limpia.startsWith('/uploads/')) {
    return `${BASE_BACKEND}${limpia}`
  }
  if (limpia.startsWith('uploads/')) {
    return `${BASE_BACKEND}/${limpia}`
  }
  return `${BASE_BACKEND}/uploads/productos/${limpia}`
}

export function manejarErrorImagenProducto(e) {
  e.currentTarget.onerror = null
  e.currentTarget.src = IMAGEN_PRODUCTO_DEFAULT
}

export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
