import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearPedidosRepository } from '../src/modules/pedidos/pedidos.repository.js';
import { crearPedidosService } from '../src/modules/pedidos/pedidos.service.js';

describe('aprobarPedido — FEFO estricto, atomicidad y trazabilidad', () => {
  it('descuenta múltiples lotes en orden FEFO, marca consumido_entero, recalcula stock y genera venta', async () => {
    const queries = [];
    const updatesLotes = [];
    const insertsPedidoLotes = [];
    let ventaInsertada = null;
    let recalculadoPara = null;

    const fakeClient = {
      query: async (sql, params) => {
        queries.push(sql);

        if (sql.includes('FROM pedidos WHERE id = $1')) {
          assert.match(sql, /FOR UPDATE/);
          return {
            rows: [{
              id: 12,
              fecha: '2026-11-10',
              subtotal: '5000.00',
              envio: '1800.00',
              total: '6800.00',
              total_modificado: null,
              motivo_modificacion: null,
              metodo_pago: 'Efectivo',
              telefono: '2664123456',
              comercio: 'Panadería Sur',
              modalidad_entrega: 'Delivery',
              direccion: 'San Martín 100',
              estado: 'pendiente',
              activo: true,
              usuario_id: 2
            }]
          };
        }

        if (sql.includes('FROM tiene t')) {
          return {
            rows: [{ producto_id: 5, cantidad: 5, nombre: 'Harina 0000', producto_activo: true }]
          };
        }

        if (sql.includes('FROM lotes') && sql.includes('ORDER BY fecha_vencimiento ASC, id ASC')) {
          assert.match(sql, /FOR UPDATE/);
          return {
            rows: [
              { id: 101, cantidad: 3, cantidad_inicial: 10, fecha_vencimiento: '2026-12-01' },
              { id: 102, cantidad: 10, cantidad_inicial: 10, fecha_vencimiento: '2027-03-01' }
            ]
          };
        }

        if (sql.includes('UPDATE lotes')) {
          updatesLotes.push({ id: params[1], nuevaCantidad: params[0] });
          return { rowCount: 1 };
        }

        if (sql.includes('INSERT INTO pedido_lotes')) {
          insertsPedidoLotes.push({
            pedidoId: params[0],
            productoId: params[1],
            loteId: params[2],
            cantidad: params[3],
            consumidoEntero: params[4]
          });
          return { rowCount: 1 };
        }

        if (sql.includes('UPDATE pedidos')) {
          return {
            rows: [{
              id: 12,
              estado: 'aprobado',
              total: '6800.00',
              activo: true
            }]
          };
        }

        if (sql.includes('INSERT INTO ventas')) {
          ventaInsertada = params;
          return { rowCount: 1 };
        }

        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearPedidosRepository({
      dbPool: { connect: async () => fakeClient },
      productosRepository: {
        recalcularStock: async (prodId, client) => {
          assert.equal(client, fakeClient);
          recalculadoPara = prodId;
        }
      }
    });

    const aprobado = await repo.aprobarPedido(12);

    assert.equal(aprobado.estado, 'aprobado');
    assert.deepEqual(updatesLotes, [
      { id: 101, nuevaCantidad: 0 },
      { id: 102, nuevaCantidad: 8 }
    ]);
    assert.deepEqual(insertsPedidoLotes, [
      { pedidoId: 12, productoId: 5, loteId: 101, cantidad: 3, consumidoEntero: true },
      { pedidoId: 12, productoId: 5, loteId: 102, cantidad: 2, consumidoEntero: false }
    ]);
    assert.equal(recalculadoPara, 5);
    assert.ok(ventaInsertada);
    assert.equal(queries[0], 'BEGIN');
    assert.equal(queries[queries.length - 1], 'COMMIT');
  });

  it('hace ROLLBACK con 409 si el stock en lotes vigentes es insuficiente', async () => {
    const queries = [];
    const fakeClient = {
      query: async (sql) => {
        queries.push(sql);
        if (sql.includes('FROM pedidos WHERE id = $1')) {
          return { rows: [{ id: 12, estado: 'pendiente', total: '2000', activo: true }] };
        }
        if (sql.includes('FROM tiene t')) {
          return { rows: [{ producto_id: 5, cantidad: 10, nombre: 'Harina', producto_activo: true }] };
        }
        if (sql.includes('FROM lotes')) {
          return { rows: [{ id: 101, cantidad: 4, cantidad_inicial: 4, fecha_vencimiento: '2027-01-01' }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearPedidosRepository({
      dbPool: { connect: async () => fakeClient }
    });

    await assert.rejects(() => repo.aprobarPedido(12), (err) => err.status === 409);
    assert.ok(queries.includes('ROLLBACK'));
    assert.equal(queries.includes('COMMIT'), false);
  });

  it('en modo manual rechaza lotes repetidos (400) y lotes vencidos con Date (409)', async () => {
    const baseClient = (loteRow) => {
      const queries = [];
      return {
        queries,
        client: {
          query: async (sql) => {
            queries.push(sql);
            if (sql.includes('FROM pedidos WHERE id = $1')) {
              return { rows: [{ id: 12, estado: 'pendiente', total: '2000', activo: true }] };
            }
            if (sql.includes('FROM tiene t')) {
              return { rows: [{ producto_id: 5, cantidad: 2, nombre: 'Harina', producto_activo: true }] };
            }
            if (sql.includes('FROM lotes')) {
              return { rows: loteRow ? [loteRow] : [] };
            }
            return { rows: [] };
          },
          release: () => {}
        }
      };
    };

    const { client: clientDup, queries: qDup } = baseClient();
    const repoDup = crearPedidosRepository({ dbPool: { connect: async () => clientDup } });
    await assert.rejects(
      () => repoDup.aprobarPedido(12, {}, [{ productoId: 5, modo: 'manual', lotes: [9, 9] }]),
      (err) => err.status === 400 && !/#\d+/.test(err.message)
    );
    assert.ok(qDup.includes('ROLLBACK'));

    const { client: clientVenc, queries: qVenc } = baseClient({
      id: 9,
      cantidad: 5,
      cantidad_inicial: 5,
      fecha_vencimiento: new Date('2020-01-01T00:00:00Z'),
      vencido: true
    });
    const repoVenc = crearPedidosRepository({ dbPool: { connect: async () => clientVenc } });
    await assert.rejects(
      () => repoVenc.aprobarPedido(12, {}, [{ productoId: 5, modo: 'manual', lotes: [9] }]),
      (err) => err.status === 409 && !/#\d+/.test(err.message)
    );
    assert.ok(qVenc.includes('ROLLBACK'));
  });
});

describe('lotes-disponibles y eliminarItemDePedido', () => {
  it('findLotesDisponiblesParaPedido devuelve el contrato esperado por ModalConfirmarAceptacion', async () => {
    const repo = crearPedidosRepository({
      dbPool: {
        query: async (sql) => {
          if (sql.includes('FROM tiene t')) {
            return {
              rows: [{
                pedido_id: 3,
                producto_id: 5,
                cantidad: 4,
                precio: '750',
                activo: true,
                nombre: 'Harina',
                marca: 'Favorita',
                producto_activo: true
              }]
            };
          }
          if (sql.includes('FROM lotes l')) {
            return {
              rows: [{
                id: 11,
                cantidad: 10,
                cantidad_inicial: 10,
                fecha_arribo: '2026-10-01',
                fecha_vencimiento: '2027-06-01',
                orden_compra_id: 1
              }]
            };
          }
          return { rows: [] };
        }
      }
    });

    const lotesDisponibles = await repo.findLotesDisponiblesParaPedido(3);
    assert.equal(lotesDisponibles.length, 1);
    assert.deepEqual(lotesDisponibles[0], {
      productoId: 5,
      nombre: 'Harina',
      marca: 'Favorita',
      productoActivo: true,
      cantidadRequerida: 4,
      lotes: [{
        id: 11,
        cantidad: 10,
        cantidadInicial: 10,
        fechaArribo: '2026-10-01',
        fechaVencimiento: '2027-06-01',
        ordenCompraId: 1
      }]
    });
  });

  it('eliminarItemDePedido exige estado pendiente y recalcula subtotal, envio y total en transacción', async () => {
    const queries = [];
    let updatePedidoParams = null;

    const fakeClient = {
      query: async (sql, params) => {
        queries.push(sql);
        if (sql.includes('SELECT') && sql.includes('FROM pedidos')) {
          return {
            rows: [{
              id: 7,
              estado: 'pendiente',
              modalidad_entrega: 'Delivery',
              activo: true
            }]
          };
        }
        if (sql.includes('UPDATE tiene SET activo = false')) {
          return { rowCount: 1 };
        }
        if (sql.includes('SELECT cantidad, precio FROM tiene')) {
          return { rows: [{ cantidad: 2, precio: '1000.00' }] };
        }
        if (sql.includes('UPDATE pedidos SET subtotal')) {
          updatePedidoParams = params;
          return { rowCount: 1 };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearPedidosRepository({ dbPool: { connect: async () => fakeClient } });
    const service = crearPedidosService({ repository: repo });

    const res = await service.eliminarItemDePedido(7, 5);
    assert.equal(res.pedido_eliminado, false);
    assert.equal(res.nuevo_subtotal, 2000);
    assert.equal(res.nuevo_envio, 1800);
    assert.equal(res.nuevo_total, 3800);
    assert.deepEqual(updatePedidoParams, [2000, 1800, 3800, 7]);
    assert.ok(queries.includes('COMMIT'));

    const fakeClientAprobado = {
      query: async (sql) => {
        if (sql.includes('FROM pedidos')) {
          return { rows: [{ id: 8, estado: 'aprobado', modalidad_entrega: 'Delivery', activo: true }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };
    const serviceAprobado = crearPedidosService({
      repository: crearPedidosRepository({ dbPool: { connect: async () => fakeClientAprobado } })
    });
    await assert.rejects(() => serviceAprobado.eliminarItemDePedido(8, 5), (err) => err.status === 409);
  });
});
