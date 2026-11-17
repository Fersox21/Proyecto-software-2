import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearLotesService } from '../src/modules/lotes/lotes.service.js';
import { crearLotesRepository } from '../src/modules/lotes/lotes.repository.js';

describe('eliminarLote', () => {
  it('rechaza la baja del único lote de la orden con 409', async () => {
    const service = crearLotesService({
      repository: {
        findById: async () => ({ id: 10, ordenCompra: { id: 3 } }),
        removeSiNoEsElUltimoLote: async () => 0
      }
    });

    await assert.rejects(
      () => service.eliminarLote(10),
      (err) => err.status === 409 && err.message === 'No se puede eliminar el único lote de la orden de compra'
    );
  });

  it('da de baja el lote cuando la orden tiene más de uno', async () => {
    let llamadoCon = null;
    const service = crearLotesService({
      repository: {
        findById: async () => ({ id: 10, ordenCompra: { id: 3 } }),
        removeSiNoEsElUltimoLote: async (id) => {
          llamadoCon = id;
          return 1;
        }
      }
    });

    const resultado = await service.eliminarLote(10);
    assert.equal(resultado, true);
    assert.equal(llamadoCon, 10);
  });

  it('responde 404 y no intenta la baja si el lote no existe', async () => {
    let eliminado = false;
    const service = crearLotesService({
      repository: {
        findById: async () => null,
        removeSiNoEsElUltimoLote: async () => {
          eliminado = true;
          return 1;
        }
      }
    });

    await assert.rejects(() => service.eliminarLote(10), (err) => err.status === 404);
    assert.equal(eliminado, false);
  });

  it('rechaza ids inválidos antes de tocar el repositorio', async () => {
    let consultado = false;
    const service = crearLotesService({
      repository: {
        findById: async () => {
          consultado = true;
          return null;
        }
      }
    });

    await assert.rejects(() => service.eliminarLote('abc'), (err) => err.status === 400);
    assert.equal(consultado, false);
  });

  it('actualizarVencimiento recalcula stock de producto dentro de transacción', async () => {
    const queries = [];
    let recalculadoPara = null;
    const fakeClient = {
      query: async (sql) => {
        queries.push(sql);
        if (sql.includes('SELECT producto_id FROM lotes')) {
          return { rows: [{ producto_id: 55 }] };
        }
        if (sql.includes('UPDATE lotes SET fecha_vencimiento')) {
          return { rowCount: 1 };
        }
        return { rows: [] };
      },
      release: () => {}
    };

    const repo = crearLotesRepository(
      { connect: async () => fakeClient },
      {
        recalcularStock: async (prodId, client) => {
          assert.equal(client, fakeClient);
          recalculadoPara = prodId;
        }
      }
    );

    const ok = await repo.updateFechaVencimiento(10, '2027-05-01');
    assert.equal(ok, true);
    assert.equal(recalculadoPara, 55);
    assert.ok(queries.some((q) => q === 'BEGIN'));
    assert.ok(queries.some((q) => q === 'COMMIT'));
  });
});
