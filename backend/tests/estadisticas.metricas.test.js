import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearEstadisticasRepository } from '../src/modules/estadisticas/estadisticas.repository.js';
import { crearEstadisticasService } from '../src/modules/estadisticas/estadisticas.service.js';
import { crearApp } from '../src/app.js';
import { crearProductosRoutes } from '../src/modules/productos/productos.routes.js';
import { crearLotesRoutes } from '../src/modules/lotes/lotes.routes.js';
import { crearOrdenesCompraRoutes } from '../src/modules/ordenesCompra/ordenesCompra.routes.js';
import { crearPedidosRoutes } from '../src/modules/pedidos/pedidos.routes.js';
import { crearVentasRoutes } from '../src/modules/ventas/ventas.routes.js';

describe('estadisticas — filtros activo = true y total_modificado real', () => {
  it('gananciasMensuales y promedioDiario filtran v.activo = true y usan COALESCE(v.total_modificado, p.total_modificado, v.total)', async () => {
    const sqls = [];
    const repo = crearEstadisticasRepository({
      query: async (sql) => {
        sqls.push(sql);
        if (sql.includes('TO_CHAR(DATE_TRUNC')) {
          return { rows: [{ periodo: '2026-11', ingresos: '4500.00', costos: '2000.00', ganancia: '2500.00' }] };
        }
        if (sql.includes('promedio_diario')) {
          return { rows: [{ total_30_dias: '4500.00', promedio_diario: '150.00' }] };
        }
        return { rows: [] };
      }
    });

    const ganancias = await repo.gananciasMensuales();
    assert.equal(ganancias[0].ingresos, '4500.00');
    assert.match(sqls[0], /v\.activo\s*=\s*true/i);
    assert.match(sqls[0], /t\.activo\s*=\s*true/i);
    assert.match(sqls[0], /COALESCE\(v\.total_modificado,\s*p\.total_modificado,\s*v\.total\)/i);

    const promedio = await repo.promedioDiario();
    assert.equal(promedio.total_30_dias, '4500.00');
    assert.match(sqls[1], /v\.activo\s*=\s*true/i);
    assert.match(sqls[1], /COALESCE\(v\.total_modificado,\s*p\.total_modificado,\s*v\.total\)/i);

    await repo.masVendidosPorMes('2026-11');
    assert.match(sqls[2], /v\.activo\s*=\s*true/i);
    assert.match(sqls[2], /t\.activo\s*=\s*true/i);
  });

  it('masVendidos rechaza formato de mes inválido con 400', async () => {
    const service = crearEstadisticasService({
      masVendidosPorMes: async () => []
    });

    await assert.rejects(() => service.obtenerMasVendidos('2026-13'), (err) => err.status === 400);
    await assert.rejects(() => service.obtenerMasVendidos('invalido'), (err) => err.status === 400);

    const ok = await service.obtenerMasVendidos('2026-11');
    assert.equal(ok.mes, '2026-11');
  });
});

describe('Endpoints /historial en los 5 módulos — orden de rutas antes de /:id', () => {
  it('GET /historial en productos, lotes, ordenesCompra, pedidos y ventas resuelve a listarHistorial y no choca con /:id', async () => {
    const passAdmin = (req, _res, next) => {
      req.usuario = { id: 1, correo: 'admin@x.com', rol: 'admin' };
      next();
    };

    const makeController = (modulo) => ({
      listar: (_req, res) => res.json({ ruta: 'listar', modulo }),
      listarHistorial: (_req, res) => res.json([{ modulo, historial: true }]),
      listarCatalogo: (_req, res) => res.json([]),
      obtener: (_req, res) => res.status(400).json({ error: 'Colisionó con /:id' }),
      obtenerLotesDisponibles: (_req, res) => res.json([]),
      obtenerProductos: (_req, res) => res.json([]),
      crear: (_req, res) => res.status(201).json({}),
      actualizar: (_req, res) => res.json({}),
      eliminar: (_req, res) => res.status(204).end(),
      eliminarItem: (_req, res) => res.json({}),
      subirImagen: (_req, res) => res.json({}),
      quitarImagen: (_req, res) => res.json({})
    });

    const app = crearApp({
      productosRoutes: crearProductosRoutes({ controller: makeController('productos'), middlewareToken: passAdmin, middlewareAdmin: passAdmin }),
      lotesRoutes: crearLotesRoutes({ controller: makeController('lotes'), middlewareToken: passAdmin, middlewareAdmin: passAdmin }),
      ordenesCompraRoutes: crearOrdenesCompraRoutes({ controller: makeController('ordenesCompra'), middlewareToken: passAdmin, middlewareAdmin: passAdmin }),
      pedidosRoutes: crearPedidosRoutes({ controller: makeController('pedidos'), middlewareToken: passAdmin, middlewareAdmin: passAdmin }),
      ventasRoutes: crearVentasRoutes({ controller: makeController('ventas'), middlewareToken: passAdmin, middlewareAdmin: passAdmin })
    });

    const server = app.listen(0, '127.0.0.1');
    await new Promise((r) => server.once('listening', r));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
      for (const modulo of ['productos', 'lotes', 'ordenesCompra', 'pedidos', 'ventas']) {
        const res = await fetch(`${baseUrl}/api/${modulo}/historial`);
        assert.equal(res.status, 200, `/api/${modulo}/historial debe responder 200`);
        const body = await res.json();
        assert.deepEqual(body, [{ modulo, historial: true }]);
      }
    } finally {
      await new Promise((r) => server.close(r));
    }
  });
});
