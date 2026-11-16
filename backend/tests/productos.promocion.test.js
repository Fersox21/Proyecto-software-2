import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/modules/productos/productos.repository.js', () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn()
}))

import * as repository from '../src/modules/productos/productos.repository.js'
import {
  porcentajeDescuento,
  precioConDescuento,
  precioVigente
} from '../src/modules/productos/productos.precio.js'
import { actualizarProducto, crearProducto } from '../src/modules/productos/productos.service.js'

const productoBase = () => ({
  nombre: 'Producto de prueba',
  precioCosto: 500,
  precioVenta: 900,
  marca: 'Marca',
  enPromocion: true,
  precioPromo: 800,
  stock: 10,
  categoria: 'Almacén',
  peso: 1000,
  destacado: false
})

describe('regla de promoción', () => {
  it('convierte venta 900 y promo 800 en un 11% exacto (801)', () => {
    expect(porcentajeDescuento(900, 800)).toBe(11)
    expect(precioConDescuento(900, 11)).toBe(801)
    expect(precioVigente({ precioVenta: 900, precioPromo: 800, enPromocion: true })).toBe(801)
  })

  it('normaliza otras promociones sin perder el porcentaje entero', () => {
    expect(precioVigente({ precioVenta: 950, precioPromo: 850, enPromocion: true })).toBe(845.5)
    expect(precioVigente({ precioVenta: 3100, precioPromo: 2800, enPromocion: true })).toBe(2790)
  })

  it('ignora la promoción cuando el flag está apagado', () => {
    expect(precioVigente({ precioVenta: 900, precioPromo: 800, enPromocion: false })).toBe(900)
  })

  it('rechaza descuentos que no se pueden representar como entero', () => {
    expect(porcentajeDescuento(900, 900)).toBeNull()
    expect(porcentajeDescuento(900, 899.99)).toBeNull()
    expect(porcentajeDescuento(900, 1000)).toBeNull()
    expect(porcentajeDescuento(900, 0)).toBeNull()
  })
})

describe('crearProducto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repository.create.mockImplementation(async (data) => data)
  })

  it('guarda el precio promocional normalizado al porcentaje entero', async () => {
    await crearProducto(productoBase())

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ precioVenta: 900, precioPromo: 801, descuento: 11 })
    )
  })

  it('rechaza una promoción igual o mayor al precio de venta', async () => {
    await expect(
      crearProducto({ ...productoBase(), precioPromo: 900 })
    ).rejects.toMatchObject({ status: 400 })

    expect(repository.create).not.toHaveBeenCalled()
  })

  it('rechaza una promo con menos de 1% de descuento', async () => {
    await expect(
      crearProducto({ ...productoBase(), precioPromo: 899.99 })
    ).rejects.toMatchObject({ status: 400 })
  })
})

describe('actualizarProducto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repository.findById.mockResolvedValue({
      id: 1,
      nombre: 'Producto de prueba',
      precioCosto: 500,
      precioVenta: 900,
      marca: 'Marca',
      enPromocion: true,
      precioPromo: 801,
      descuento: 11,
      stock: 10,
      categoria: 'Almacén',
      peso: 1000,
      destacado: false
    })
    repository.update.mockImplementation(async (id, data) => data)
  })

  it('recalcula la promo al cambiar el precio de venta', async () => {
    await actualizarProducto(1, { precioVenta: 1000 })

    expect(repository.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ precioVenta: 1000, precioPromo: 800, descuento: 20 })
    )
  })

  it('rechaza una actualización que deja la promo inválida', async () => {
    await expect(
      actualizarProducto(1, { precioVenta: 800 })
    ).rejects.toMatchObject({ status: 400 })

    expect(repository.update).not.toHaveBeenCalled()
  })
})
