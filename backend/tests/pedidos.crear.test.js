import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearPedidosService } from '../src/modules/pedidos/pedidos.service.js';
import { crearPedidosRepository } from '../src/modules/pedidos/pedidos.repository.js';

const pedidoBase = () => ({
  nombreComercio: 'Panadería La Espiga',
  telefono: '2664123456',
  personaContacto: 'Pedro Álvarez',
  metodoEntrega: 'estandar',
  direccion: 'Rivadavia 500',
  descripcionDireccion: 'Portón negro',
  observacionesPedido: 'Llamar antes de llegar',
  items: [{ productoId: 5, cantidad: 2, precioUnitario: 1 }]
});

describe('crearPedido (servicio)', () => {
  it('recalcula envío en servidor según modalidadEntrega y umbral, ignorando envío del cliente', async () => {
    let recibido = null;
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => ({ id: 5, precioVenta: '750.00', activo: true, visibleCatalogo: true }) },
      repository: {
        createConItems: async (pedido, items) => {
          recibido = { pedido, items };
          return { id: 10, ...pedido, items };
        }
      }
    });

    await service.crearPedido({ ...pedidoBase(), envio: 0 });

    assert.equal(recibido.pedido.comercio, 'Panadería La Espiga');
    assert.equal(recibido.pedido.modalidadEntrega, 'Delivery');
    assert.equal(recibido.pedido.subtotal, 1500);
    assert.equal(recibido.pedido.envio, 1800);
    assert.equal(recibido.pedido.total, 3300);
    assert.deepEqual(recibido.items, [{ productoId: 5, cantidad: 2, precio: 750 }]);
  });

  it('aplica envío gratis si el subtotal alcanza $60.000', async () => {
    let recibido = null;
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => ({ id: 5, precioVenta: '30000.00', activo: true, visibleCatalogo: true }) },
      repository: {
        createConItems: async (pedido, items) => {
          recibido = { pedido, items };
          return { id: 10, ...pedido, items };
        }
      }
    });

    await service.crearPedido(pedidoBase());
    assert.equal(recibido.pedido.subtotal, 60000);
    assert.equal(recibido.pedido.envio, 0);
    assert.equal(recibido.pedido.total, 60000);
  });

  it('usa "Retiro en local" y envío 0 cuando la entrega es retiro', async () => {
    let recibido = null;
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => ({ id: 5, precioVenta: '750.00', activo: true, visibleCatalogo: true }) },
      repository: {
        createConItems: async (pedido, items) => {
          recibido = { pedido, items };
          return { id: 10, ...pedido, items };
        }
      }
    });

    await service.crearPedido({ ...pedidoBase(), metodoEntrega: 'retiro', direccion: '' });
    assert.equal(recibido.pedido.modalidadEntrega, 'Retiro');
    assert.equal(recibido.pedido.direccion, 'Retiro en local');
    assert.equal(recibido.pedido.envio, 0);
    assert.equal(recibido.pedido.total, 1500);
  });

  it('rechaza un pedido sin ítems', async () => {
    let llamado = false;
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repository: { createConItems: async () => { llamado = true; } }
    });

    await assert.rejects(() => service.crearPedido({ ...pedidoBase(), items: [] }), (err) => err.status === 400);
    assert.equal(llamado, false);
  });

  it('exige teléfono válido y dirección en envíos a domicilio', async () => {
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) }
    });

    await assert.rejects(
      () => service.crearPedido({ ...pedidoBase(), telefono: '' }),
      (err) => err.status === 400 && err.message === 'El teléfono de contacto es obligatorio'
    );
    await assert.rejects(
      () => service.crearPedido({ ...pedidoBase(), telefono: 'abc' }),
      (err) => err.status === 400
    );
    await assert.rejects(
      () => service.crearPedido({ ...pedidoBase(), direccion: '' }),
      (err) => err.status === 400
    );
  });

  it('responde 404 si el producto no existe y 400 si está oculto o inactivo', async () => {
    const serviceNoExiste = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => null }
    });
    await assert.rejects(() => serviceNoExiste.crearPedido(pedidoBase()), (err) => err.status === 404);

    const serviceOculto = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => ({ id: 5, precioVenta: '750.00', activo: true, visibleCatalogo: false }) }
    });
    await assert.rejects(() => serviceOculto.crearPedido(pedidoBase()), (err) => err.status === 400);
  });

  it('acumula cantidades si el mismo producto viene repetido', async () => {
    let itemsGuardados = null;
    const service = crearPedidosService({
      repositoryRol: { findById: async () => ({ id: 2 }) },
      repositoryProducto: { findById: async () => ({ id: 5, precioVenta: '750.00', activo: true, visibleCatalogo: true }) },
      repository: {
        createConItems: async (_pedido, items) => {
          itemsGuardados = items;
          return { id: 10, items };
        }
      }
    });

    await service.crearPedido({
      ...pedidoBase(),
      items: [
        { productoId: 5, cantidad: 1 },
        { productoId: 5, cantidad: 2 }
      ]
    });

    assert.deepEqual(itemsGuardados, [{ productoId: 5, cantidad: 3, precio: 750 }]);
  });

  it('falla con 500 si no existe el usuario por defecto', async () => {
    const service = crearPedidosService({
      repositoryRol: { findById: async () => null }
    });

    await assert.rejects(() => service.crearPedido(pedidoBase()), (err) => err.status === 500);
  });
});

describe('createConItems (transacción y candado FOR UPDATE)', () => {
  it('usa BEGIN, FOR UPDATE sobre productos y hace ROLLBACK con 400 ante lotes vencidos o sin stock', async () => {
    const queries = [];
    const fakeClient = {
      query: async (sql) => {
        queries.push(sql);
        if (sql.includes('FROM productos')) {
          assert.match(sql, /FOR UPDATE/);
          return { rows: [{ id: 5, nombre: 'Harina', stock: 10, activo: true, visible_catalogo: true }] };
        }
        if (sql.includes('FROM lotes')) {
          return { rows: [{ stock_vigente: 0 }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearPedidosRepository({
      dbPool: { connect: async () => fakeClient }
    });

    await assert.rejects(
      () => repo.createConItems(
        {
          subtotal: 1500,
          envio: 1800,
          total: 3300,
          metodoPago: 'Efectivo',
          telefono: '2664123456',
          comercio: 'La Espiga',
          modalidadEntrega: 'Delivery',
          direccion: 'Rivadavia 500',
          estado: 'pendiente',
          usuarioId: 2
        },
        [{ productoId: 5, cantidad: 2, precio: 750 }]
      ),
      (err) => err.status === 400
    );

    assert.equal(queries[0], 'BEGIN');
    assert.ok(queries.some((q) => q === 'ROLLBACK'));
    assert.equal(queries.some((q) => q === 'COMMIT'), false);
  });
});
