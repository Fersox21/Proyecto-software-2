import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/modules/pedidos/pedidos.repository.js', () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findByIdConItems: vi.fn(),
  findItemsByPedido: vi.fn(),
  createConItems: vi.fn(),
  aprobarPedido: vi.fn(),
  update: vi.fn(),
  remove: vi.fn()
}))

vi.mock('../src/modules/roles/roles.repository.js', () => ({
  findById: vi.fn()
}))

vi.mock('../src/modules/tiene/tiene.repository.js', () => ({
  remove: vi.fn(),
  findByPedido: vi.fn()
}))

vi.mock('../src/modules/productos/productos.repository.js', () => ({
  findById: vi.fn()
}))

import * as repository from '../src/modules/pedidos/pedidos.repository.js'
import * as repositoryRol from '../src/modules/roles/roles.repository.js'
import * as repositoryProducto from '../src/modules/productos/productos.repository.js'
import { crearPedido } from '../src/modules/pedidos/pedidos.service.js'

const pedidoBase = () => ({
  nombreComercio: 'Panadería La Espiga',
  telefono: '2664123456',
  personaContacto: 'Pedro Álvarez',
  metodoEntrega: 'estandar',
  direccion: 'Rivadavia 500',
  descripcionDireccion: 'Portón negro',
  observacionesPedido: 'Llamar antes de llegar',
  items: [{ productoId: 5, cantidad: 2, precioUnitario: 1 }]
})

describe('crearPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repositoryRol.findById.mockResolvedValue({ id: 2 })
    repositoryProducto.findById.mockResolvedValue({ id: 5, precioVenta: '750.00' })
    repository.createConItems.mockResolvedValue({ id: 10, items: [] })
  })

  it('mapea el DTO del checkout y recalcula el total con el precio de la base', async () => {
    await crearPedido({ ...pedidoBase(), envio: 1800 })

    expect(repository.createConItems).toHaveBeenCalledWith(
      expect.objectContaining({
        comercio: 'Panadería La Espiga',
        telefono: '2664123456',
        modalidadEntrega: 'Delivery',
        direccion: 'Rivadavia 500',
        descripcionDireccion: 'Portón negro',
        personaContacto: 'Pedro Álvarez',
        observaciones: 'Llamar antes de llegar',
        subtotal: 1500,
        envio: 1800,
        estado: 'pendiente',
        metodoPago: 'Efectivo',
        usuarioId: 2,
        total: 3300
      }),
      [{ productoId: 5, cantidad: 2, precio: 750 }]
    )
  })

  it('usa "Retiro en local" cuando la entrega es retiro', async () => {
    await crearPedido({ ...pedidoBase(), metodoEntrega: 'retiro', direccion: '' })

    expect(repository.createConItems).toHaveBeenCalledWith(
      expect.objectContaining({
        modalidadEntrega: 'Retiro',
        direccion: 'Retiro en local'
      }),
      expect.any(Array)
    )
  })

  it('rechaza un pedido sin ítems', async () => {
    await expect(crearPedido({ ...pedidoBase(), items: [] })).rejects.toMatchObject({
      status: 400
    })
    expect(repository.createConItems).not.toHaveBeenCalled()
  })

  it('exige teléfono de contacto', async () => {
    await expect(crearPedido({ ...pedidoBase(), telefono: '' })).rejects.toMatchObject({
      message: 'El teléfono de contacto es obligatorio',
      status: 400
    })
  })

  it('exige dirección cuando la entrega es a domicilio', async () => {
    await expect(crearPedido({ ...pedidoBase(), direccion: '' })).rejects.toMatchObject({
      status: 400
    })
  })

  it('responde 404 si el producto no existe', async () => {
    repositoryProducto.findById.mockResolvedValue(null)

    await expect(crearPedido(pedidoBase())).rejects.toMatchObject({
      status: 404
    })
  })

  it('acumula cantidades si el mismo producto viene repetido', async () => {
    await crearPedido({
      ...pedidoBase(),
      items: [
        { productoId: 5, cantidad: 1 },
        { productoId: 5, cantidad: 2 }
      ]
    })

    expect(repository.createConItems).toHaveBeenCalledWith(expect.anything(), [
      { productoId: 5, cantidad: 3, precio: 750 }
    ])
  })

  it('falla con 500 si no existe el usuario por defecto', async () => {
    repositoryRol.findById.mockResolvedValue(null)

    await expect(crearPedido(pedidoBase())).rejects.toMatchObject({
      status: 500
    })
  })
})
