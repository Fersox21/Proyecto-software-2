import { describe, expect, it } from 'vitest'

import {
  calcularDescuento,
  formatearPrecio,
  obtenerPreciosProducto,
  precioConDescuento
} from '../src/shared/utils/formato.js'

describe('descuento de promoción', () => {
  it('convierte venta 900 y promo 800 en un 11% exacto (801)', () => {
    const precios = obtenerPreciosProducto({
      precioVenta: '900.00',
      precioPromo: '800.00',
      enPromocion: true
    })

    expect(precios.descuento).toBe(11)
    expect(precios.precioVigente).toBe(801)
    expect(precios.precioPromo).toBe(801)
    expect(precios.ahorro).toBe(99)
  })

  it('normaliza las promociones del catálogo', () => {
    expect(obtenerPreciosProducto({ precioVenta: 950, precioPromo: 850, enPromocion: true }).precioVigente).toBe(845.5)
    expect(obtenerPreciosProducto({ precioVenta: 3100, precioPromo: 2800, enPromocion: true }).precioVigente).toBe(2790)
  })

  it('no inventa descuentos cuando la promo no es válida', () => {
    expect(calcularDescuento(1000, 999.99)).toBeNull()
    expect(calcularDescuento(1000, 1000)).toBeNull()
    expect(calcularDescuento(1000, 10)).toBe(99)

    const sinPromo = obtenerPreciosProducto({ precioVenta: 900, enPromocion: false })
    expect(sinPromo.descuento).toBeNull()
    expect(sinPromo.precioVigente).toBe(900)
  })

  it('calcula el precio a partir del porcentaje', () => {
    expect(precioConDescuento(900, 11)).toBe(801)
    expect(precioConDescuento(950, 11)).toBe(845.5)
  })

  it('muestra los centavos cuando el precio los tiene', () => {
    expect(formatearPrecio(845.5)).toContain('845,50')
    expect(formatearPrecio(801)).toContain('801')
  })
})
