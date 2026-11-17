import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { crearApp } from '../src/app.js';
import { crearVentasRepository } from '../src/modules/ventas/ventas.repository.js';
import { crearVentasService } from '../src/modules/ventas/ventas.service.js';
import { crearVentasController } from '../src/modules/ventas/ventas.controller.js';
import { crearVentasRoutes } from '../src/modules/ventas/ventas.routes.js';

describe('Ventas — historial en GET /:id y /:id/productos + validación de fechas', () => {
  let server;
  let baseUrl;

  const ventaInactiva = {
    id: 14,
    fecha: '2026-11-05',
    total: '2550.00',
    activo: false,
    pedido_id: 1,
    total_modificado: null,
    motivo_modificacion: null,
    p_id: 1,
    p_fecha: '2026-11-05',
    p_subtotal: '2550.00',
    p_envio: '0.00',
    p_total: '2550.00',
    p_total_modificado: null,
    p_motivo_modificacion: null,
    p_estado: 'entregado',
    p_metodo_pago: 'Efectivo',
    p_telefono: '2664123456',
    p_comercio: 'La Fe',
    p_persona_contacto: 'Pedro',
    p_modalidad_entrega: 'Delivery',
    p_direccion: 'San Martín 123',
    p_descripcion_direccion: null,
    p_observaciones: null
  };

  const passAdmin = (req, _res, next) => {
    req.usuario = { id: 1, correo: 'admin@x.com', rol: 'admin' };
    next();
  };

  before(async () => {
    const repo = crearVentasRepository({
      query: async (sql, params) => {
        if (sql.includes('FROM ventas v') && sql.includes('WHERE v.id = $1')) {
          const filtraActivo = sql.includes('v.activo = true');
          if (Number(params[0]) !== ventaInactiva.id) return { rows: [] };
          if (filtraActivo && !ventaInactiva.activo) return { rows: [] };
          return { rows: [{ ...ventaInactiva }] };
        }
        if (sql.includes('FROM tiene t')) {
          return {
            rows: [{ producto_id: 2, nombre: 'Leche', marca: 'LS', cantidad: 2, precio: '1275.00' }]
          };
        }
        return { rows: [] };
      }
    });

    const service = crearVentasService({ ventasRepository: repo });
    const controller = crearVentasController(service);
    const ventasRoutes = crearVentasRoutes({
      controller,
      middlewareToken: passAdmin,
      middlewareAdmin: passAdmin
    });

    const app = crearApp({ ventasRoutes });
    server = app.listen(0, '127.0.0.1');
    await new Promise((r) => server.once('listening', r));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((r) => server.close(r));
  });

  it('GET /api/ventas/:id devuelve 404 para venta inactiva sin query y no expone ID en mensaje', async () => {
    const res = await fetch(`${baseUrl}/api/ventas/14`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error, 'Venta no encontrada');
    assert.doesNotMatch(body.error, /14/);
  });

  it('GET /api/ventas/:id?historial=true devuelve 200 con detalle e items para venta inactiva', async () => {
    const res = await fetch(`${baseUrl}/api/ventas/14?historial=true`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.id, 14);
    assert.equal(body.activo, false);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].nombre, 'Leche');
  });

  it('GET /api/ventas/:id/productos devuelve 404 sin historial=true y 200 con ?historial=true', async () => {
    const resSin = await fetch(`${baseUrl}/api/ventas/14/productos`);
    assert.equal(resSin.status, 404);
    const bodySin = await resSin.json();
    assert.equal(bodySin.error, 'Venta no encontrada');

    const resCon = await fetch(`${baseUrl}/api/ventas/14/productos?historial=true`);
    assert.equal(resCon.status, 200);
    const items = await resCon.json();
    assert.equal(items.length, 1);
    assert.equal(items[0].nombre, 'Leche');
  });

  it('crearVenta y update rechazan fechas con formato o calendario inválido con 400 antes de consultar PG', async () => {
    let consultoPg = false;
    const service = crearVentasService({
      ventasRepository: {
        obtener: async () => {
          consultoPg = true;
          return [];
        },
        obtenerPorPedidoId: async () => {
          consultoPg = true;
          return null;
        }
      },
      repositoryPedidos: {
        findById: async () => {
          consultoPg = true;
          return { id: 1 };
        }
      }
    });

    for (const fechaInvalida of ['2026-02-31', '2026/11/01', 'invalida', 12345, '']) {
      await assert.rejects(
        () => service.crearVenta({ pedido_id: 1, fecha: fechaInvalida, total: 100 }),
        (err) => err.status === 400
      );
      await assert.rejects(
        () => service.update(1, { fecha: fechaInvalida }),
        (err) => err.status === 400
      );
    }

    assert.equal(consultoPg, false);
  });
});
