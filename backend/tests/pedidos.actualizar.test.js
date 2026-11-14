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
import { actualizarPedido } from '../src/modules/pedidos/pedidos.service.js'

const pedidoPendiente = {
  id: 7,
  fecha: '2026-11-01',
  subtotal: '2000.00',
  envio: '500.00',
  total: '2500.00',
  metodoPago: 'Efectivo',
  telefono: '2664123456',
  comercio: 'La Espiga',
  personaContacto: 'Pedro Álvarez',
  modalidadEntrega: 'Delivery',
  direccion: 'Rivadavia 500',
  descripcionDireccion: 'Portón negro',
  observaciones: 'Llamar antes de llegar',
  estado: 'pendiente',
  motivoRechazo: null,
  activo: true,
  usuarioId: 2
}

describe('actualizarPedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repository.findById.mockResolvedValue({ ...pedidoPendiente })
    repository.update.mockImplementation(async (id, data) => ({ id, ...data }))
    repository.aprobarPedido.mockResolvedValue({ ...pedidoPendiente, estado: 'aprobado' })
  })

  it('actualiza solo el estado sin perder el resto de los campos', async () => {
    await actualizarPedido(7, { estado: 'cancelado', motivoRechazo: 'Sin stock' })

    expect(repository.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        fecha: '2026-11-01',
        subtotal: '2000.00',
        envio: '500.00',
        total: '2500.00',
        telefono: '2664123456',
        comercio: 'La Espiga',
        personaContacto: 'Pedro Álvarez',
        observaciones: 'Llamar antes de llegar',
        estado: 'rechazado',
        motivoRechazo: 'Sin stock'
      })
    )
  })

  it('exige un motivo al rechazar un pedido', async () => {
    await expect(actualizarPedido(7, { estado: 'cancelado' })).rejects.toMatchObject({
      message: 'El motivo de rechazo es obligatorio',
      status: 400
    })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('aprueba el pedido delegando en la transacción de stock y venta', async () => {
    await actualizarPedido(7, { estado: 'aceptado' })

    expect(repository.aprobarPedido).toHaveBeenCalledWith(7)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rechaza estados desconocidos con 400', async () => {
    await expect(actualizarPedido(7, { estado: 'volando' })).rejects.toMatchObject({
      status: 400
    })
  })

  it('no permite aprobar un pedido que ya no está pendiente', async () => {
    repository.findById.mockResolvedValue({ ...pedidoPendiente, estado: 'aprobado' })

    await expect(actualizarPedido(7, { estado: 'aprobado' })).rejects.toMatchObject({
      status: 409
    })
    expect(repository.aprobarPedido).not.toHaveBeenCalled()
  })

  it('responde 404 si el pedido no existe', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(actualizarPedido(99, { estado: 'rechazado' })).rejects.toMatchObject({
      status: 404
    })
  })

  it('permite actualizar la dirección sin cambiar el estado', async () => {
    await actualizarPedido(7, { direccion: 'Nueva 123' })

    expect(repository.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        estado: 'pendiente',
        direccion: 'Nueva 123'
      })
    )
  })
})
