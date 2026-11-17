import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearOrdenesCompraRepository } from '../src/modules/ordenesCompra/ordenesCompra.repository.js';
import { crearOrdenesCompraService } from '../src/modules/ordenesCompra/ordenesCompra.service.js';

describe('ordenesCompra — transacciones, activo = true y conflictos 409', () => {
  it('findAll y findById filtran oc.activo = true (historial permite inactivos)', async () => {
    const sqls = [];
    const repo = crearOrdenesCompraRepository({
      dbPool: {
        query: async (sql) => {
          sqls.push(sql);
          if (sql.includes('FROM ordenes_compra oc')) {
            return { rows: [{ id: 1, fecha: '2026-11-01', total: '1000', activo: true }] };
          }
          return { rows: [] };
        }
      }
    });

    await repo.findAll();
    assert.match(sqls[0], /WHERE oc\.activo = true/);

    await repo.findById(1, false);
    assert.match(sqls[1], /WHERE oc\.id = \$1 AND oc\.activo = true/);

    await repo.findById(1, true);
    assert.doesNotMatch(sqls[3], /AND oc\.activo = true/);
  });

  it('create ejecuta BEGIN/COMMIT, crea lotes, recalcula stock y unifica imagen en productoNuevo', async () => {
    const queries = [];
    let stockRecalculado = null;
    let prodCreado = null;

    const fakeClient = {
      query: async (sql, params) => {
        queries.push(sql);
        if (sql.includes('INSERT INTO ordenes_compra')) {
          return { rows: [{ id: 20, fecha: params[0], total: params[1], activo: true, proveedor_id: params[2] }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearOrdenesCompraRepository({
      dbPool: {
        connect: async () => fakeClient,
        query: async (sql) => {
          if (sql.includes('FROM ordenes_compra oc')) {
            return { rows: [{ id: 20, fecha: '2026-11-01', total: '5000', activo: true }] };
          }
          return { rows: [] };
        }
      },
      categoriasRepository: {
        findById: async () => ({ id: 1, nombre: 'Almacén', activo: true })
      },
      productosRepository: {
        create: async (data) => {
          prodCreado = data;
          return { id: 88, ...data };
        },
        recalcularStock: async (prodId) => {
          stockRecalculado = prodId;
        }
      }
    });

    const service = crearOrdenesCompraService({
      repository: repo,
      repositoryProveedor: { findById: async () => ({ id: 1, activo: true }) },
      repositoryCategoria: { findById: async () => ({ id: 1, nombre: 'Almacén', activo: true }) }
    });

    await service.crearOrdenCompra(
      {
        proveedorId: 1,
        fecha: '2026-11-01',
        total: 5000,
        lotes: [{
          cantidad: 10,
          fechaArribo: '2026-11-02',
          fechaVencimiento: '2027-06-01',
          productoNuevo: {
            nombre: 'Budín',
            precioCosto: 500,
            precioVenta: 900,
            categoriaId: 1
          }
        }]
      },
      [{ fieldname: 'imagenProducto_0', filename: 'budin.jpg' }]
    );

    assert.equal(prodCreado.imagen, '/uploads/productos/budin.jpg');
    assert.equal(stockRecalculado, 88);
    assert.equal(queries[0], 'BEGIN');
    assert.ok(queries.includes('COMMIT'));
  });

  it('update y remove devuelven 409 y hacen ROLLBACK si algún lote ya registró ventas', async () => {
    const queriesUpdate = [];
    const clientUpdate = {
      query: async (sql) => {
        queriesUpdate.push(sql);
        if (sql.includes('FROM ordenes_compra')) return { rows: [{ id: 5 }] };
        if (sql.includes('FROM lotes')) {
          return { rows: [{ id: 1, producto_id: 2, cantidad: 4, cantidad_inicial: 10 }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repoUpdate = crearOrdenesCompraRepository({
      dbPool: { connect: async () => clientUpdate }
    });

    await assert.rejects(
      () => repoUpdate.update(5, { total: 1000, fecha: '2026-11-01', lotes: [] }),
      (err) => err.status === 409
    );
    assert.ok(queriesUpdate.includes('ROLLBACK'));

    const queriesRemove = [];
    const clientRemove = {
      query: async (sql) => {
        queriesRemove.push(sql);
        if (sql.includes('FROM ordenes_compra')) return { rows: [{ id: 5 }] };
        if (sql.includes('FROM lotes')) {
          return { rows: [{ id: 1, producto_id: 2, cantidad: 4, cantidad_inicial: 10 }] };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repoRemove = crearOrdenesCompraRepository({
      dbPool: { connect: async () => clientRemove }
    });

    await assert.rejects(() => repoRemove.remove(5), (err) => err.status === 409);
    assert.ok(queriesRemove.includes('ROLLBACK'));
  });

  it('actualizarOrdenCompra normaliza fecha Date de pg al editar lotes sin reenviar fecha', async () => {
    let updateRecibido = null;
    const service = crearOrdenesCompraService({
      repository: {
        findById: async () => ({
          id: 5,
          fecha: new Date('2026-11-01T00:00:00'),
          total: 5000,
          activo: true
        }),
        update: async (id, data) => {
          updateRecibido = { id, data };
          return { id, ...data };
        }
      },
      repositoryProducto: {
        findById: async () => ({ id: 3, precioCosto: 500, activo: true })
      }
    });

    await service.actualizarOrdenCompra(5, {
      lotes: [{
        productoId: 3,
        cantidad: 10,
        fechaArribo: '2026-11-05',
        fechaVencimiento: '2027-06-01'
      }]
    });

    assert.equal(updateRecibido.id, 5);
    assert.equal(updateRecibido.data.fecha, '2026-11-01');

    await assert.rejects(
      () => service.actualizarOrdenCompra(5, {
        lotes: [{
          productoId: 3,
          cantidad: 10,
          fechaArribo: '2026-10-30',
          fechaVencimiento: '2027-06-01'
        }]
      }),
      (err) => err.status === 400
    );
  });
});
