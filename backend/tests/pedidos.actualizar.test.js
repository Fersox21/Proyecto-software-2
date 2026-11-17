import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearPedidosService } from '../src/modules/pedidos/pedidos.service.js';

const pedidoPendiente = {
  id: 7,
  fecha: '2026-11-01',
  subtotal: '2000.00',
  envio: '1800.00',
  total: '3800.00',
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
};

describe('actualizarPedido', () => {
  it('actualiza solo el estado sin perder el resto de los campos', async () => {
    let payloadActualizado = null;
    const service = crearPedidosService({
      repository: {
        findById: async () => ({ ...pedidoPendiente }),
        update: async (id, data) => {
          payloadActualizado = { id, data };
          return { id, ...data };
        }
      }
    });

    await service.actualizarPedido(7, { estado: 'cancelado', motivoRechazo: 'Sin stock' });

    assert.equal(payloadActualizado.id, 7);
    assert.equal(payloadActualizado.data.estado, 'rechazado');
    assert.equal(payloadActualizado.data.motivoRechazo, 'Sin stock');
    assert.equal(payloadActualizado.data.comercio, 'La Espiga');
    assert.equal(payloadActualizado.data.subtotal, '2000.00');
    assert.equal(payloadActualizado.data.envio, '1800.00');
  });

  it('exige un motivo al rechazar un pedido', async () => {
    let actualizado = false;
    const service = crearPedidosService({
      repository: {
        findById: async () => ({ ...pedidoPendiente }),
        update: async () => {
          actualizado = true;
        }
      }
    });

    await assert.rejects(
      () => service.actualizarPedido(7, { estado: 'cancelado' }),
      (err) => err.status === 400 && err.message === 'El motivo de rechazo es obligatorio'
    );
    assert.equal(actualizado, false);
  });

  it('aprueba el pedido delegando en la transacción de stock y venta', async () => {
    let llamadoAprobar = null;
    let llamadoUpdate = false;
    const asignaciones = [{ productoId: 5, modo: 'auto', lotes: [] }];

    const service = crearPedidosService({
      repository: {
        findById: async () => ({ ...pedidoPendiente }),
        aprobarPedido: async (id, mod, asig) => {
          llamadoAprobar = { id, mod, asig };
          return { ...pedidoPendiente, estado: 'aprobado' };
        },
        update: async () => {
          llamadoUpdate = true;
        }
      }
    });

    await service.actualizarPedido(7, { estado: 'aceptado', asignacionesLotes: asignaciones });

    assert.deepEqual(llamadoAprobar, { id: 7, mod: {}, asig: asignaciones });
    assert.equal(llamadoUpdate, false);
  });

  it('rechaza estados desconocidos con 400', async () => {
    const service = crearPedidosService({
      repository: { findById: async () => ({ ...pedidoPendiente }) }
    });

    await assert.rejects(() => service.actualizarPedido(7, { estado: 'volando' }), (err) => err.status === 400);
  });

  it('no permite aprobar un pedido que ya no está pendiente', async () => {
    let llamadoAprobar = false;
    const service = crearPedidosService({
      repository: {
        findById: async () => ({ ...pedidoPendiente, estado: 'aprobado' }),
        aprobarPedido: async () => {
          llamadoAprobar = true;
        }
      }
    });

    await assert.rejects(() => service.actualizarPedido(7, { estado: 'aprobado' }), (err) => err.status === 409);
    assert.equal(llamadoAprobar, false);
  });

  it('responde 404 si el pedido no existe', async () => {
    const service = crearPedidosService({
      repository: { findById: async () => null }
    });

    await assert.rejects(() => service.actualizarPedido(99, { estado: 'rechazado' }), (err) => err.status === 404);
  });

  it('permite actualizar la dirección sin cambiar el estado', async () => {
    let payloadActualizado = null;
    const service = crearPedidosService({
      repository: {
        findById: async () => ({ ...pedidoPendiente }),
        update: async (id, data) => {
          payloadActualizado = { id, data };
          return { id, ...data };
        }
      }
    });

    await service.actualizarPedido(7, { direccion: 'Nueva 123' });

    assert.equal(payloadActualizado.id, 7);
    assert.equal(payloadActualizado.data.estado, 'pendiente');
    assert.equal(payloadActualizado.data.direccion, 'Nueva 123');
  });
});
