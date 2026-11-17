// Lógica pura de vencimientos: sin estado ni llamadas HTTP.

export const DIAS_AVISO_POR_DEFECTO = 30
export const UMBRALES_AVISO = [15, 30, 60]

const UN_DIA_MS = 24 * 60 * 60 * 1000

export function hoyISO() {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

// El backend serializa java.sql.Date como ISO con hora; comparamos siempre por
// los primeros 10 caracteres (yyyy-MM-dd) para no depender de la zona horaria.
export function soloFecha(valor) {
  return String(valor ?? '').slice(0, 10)
}

export function diasHasta(fechaISO, hoy = hoyISO()) {
  const fecha = soloFecha(fechaISO)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null

  const destino = Date.parse(`${fecha}T00:00:00Z`)
  const base = Date.parse(`${hoy}T00:00:00Z`)
  if (Number.isNaN(destino) || Number.isNaN(base)) return null

  return Math.round((destino - base) / UN_DIA_MS)
}

export function estadoVencimiento(fechaISO, hoy = hoyISO(), diasAviso = DIAS_AVISO_POR_DEFECTO) {
  const dias = diasHasta(fechaISO, hoy)

  if (dias === null) return { clave: 'desconocido', etiqueta: 'Sin fecha' }
  if (dias < 0) return { clave: 'vencido', etiqueta: 'Vencido' }
  if (dias <= diasAviso) return { clave: 'proximo', etiqueta: 'Próximo a vencer' }
  return { clave: 'en-regla', etiqueta: 'En regla' }
}

export function textoDias(dias) {
  if (dias === null) return '—'
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence en 1 día'
  if (dias > 1) return `Vence en ${dias} días`
  if (dias === -1) return 'Vencido hace 1 día'
  return `Vencido hace ${Math.abs(dias)} días`
}

export function nombreProducto(lote) {
  return lote?.producto?.nombre || 'Sin producto'
}

export function nombreProveedor(lote) {
  return lote?.ordenCompra?.proveedor?.nombre || 'Sin proveedor'
}

export function compararPorVencimiento(a, b) {
  const fechaA = soloFecha(a.fechaVencimiento) || '9999-12-31'
  const fechaB = soloFecha(b.fechaVencimiento) || '9999-12-31'
  if (fechaA < fechaB) return -1
  if (fechaA > fechaB) return 1
  return Number(a.id ?? 0) - Number(b.id ?? 0)
}

export function compararPorProveedor(a, b) {
  const nombreA = nombreProveedor(a).toLocaleLowerCase('es')
  const nombreB = nombreProveedor(b).toLocaleLowerCase('es')
  const resultado = nombreA.localeCompare(nombreB, 'es')
  if (resultado !== 0) return resultado
  return compararPorVencimiento(a, b)
}
