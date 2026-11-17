import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

import defaultApp, { crearApp } from '../src/app.js';
import { crearRolesRepository } from '../src/modules/roles/roles.repository.js';
import { crearRolesService } from '../src/modules/roles/roles.service.js';
import { crearRolesController } from '../src/modules/roles/roles.controller.js';
import { crearRolesRoutes } from '../src/modules/roles/roles.routes.js';
import { crearAuthRoutes } from '../src/modules/auth/auth.routes.js';
import { crearProductosRoutes } from '../src/modules/productos/productos.routes.js';
import { crearLotesRoutes } from '../src/modules/lotes/lotes.routes.js';
import { crearOrdenesCompraRoutes } from '../src/modules/ordenesCompra/ordenesCompra.routes.js';
import { crearProveedoresRoutes } from '../src/modules/proveedores/proveedores.routes.js';
import { crearPedidosRoutes } from '../src/modules/pedidos/pedidos.routes.js';
import { crearVentasRoutes } from '../src/modules/ventas/ventas.routes.js';
import { crearEstadisticasRoutes } from '../src/modules/estadisticas/estadisticas.routes.js';
import { crearTieneRoutes } from '../src/modules/tiene/tiene.routes.js';
import { crearVerificarToken, soloAdmin } from '../src/middlewares/verificarToken.js';

const SECRETO = 'test-rbac-secret';

describe('Roles — seguridad, sin exposición de password y POST /api/roles', () => {
  it('roles.repository nunca ejecuta SELECT * ni RETURNING * y jamás expone password', async () => {
    const sqls = [];
    const fakePool = {
      query: async (sql, params) => {
        sqls.push(sql);
        if (sql.includes('INSERT INTO usuarios')) {
          return { rows: [{ id: 10, correo: params[0], rol: params[2], activo: true }] };
        }
        if (sql.includes('UPDATE usuarios') && sql.includes('RETURNING')) {
          return { rows: [{ id: params[params.length - 1], correo: params[0], rol: params[params.length - 2], activo: true }] };
        }
        return { rows: [{ id: 1, correo: 'admin@x.com', rol: 'admin', activo: true }] };
      }
    };

    const repo = crearRolesRepository(fakePool);
    const service = crearRolesService(repo);

    const lista = await service.listarRoles();
    assert.equal(lista[0].password, undefined);

    const creado = await service.crearRol({ correo: ' Nuevo@Test.com ', password: 'Password123', rol: 'admin' });
    assert.equal(creado.correo, 'nuevo@test.com');
    assert.equal(creado.rol, 'admin');
    assert.equal(creado.password, undefined);

    const actualizado = await service.actualizarRol(1, { correo: 'edit@test.com' });
    assert.equal(actualizado.password, undefined);

    for (const sql of sqls) {
      assert.doesNotMatch(sql, /SELECT \*/i);
      assert.doesNotMatch(sql, /RETURNING \*/i);
      assert.doesNotMatch(sql, /password/i.test(sql) && !sql.includes('INSERT') && !sql.includes('SET correo = $1, password') ? /password/i : /^$/);
    }
  });

  it('crearRol valida rol (admin/cliente), rechaza inválidos y maneja 23505 con 409', async () => {
    const repo23505 = crearRolesRepository({
      query: async () => {
        const err = new Error('duplicate');
        err.code = '23505';
        throw err;
      }
    });
    const service = crearRolesService(repo23505);

    await assert.rejects(
      () => service.crearRol({ correo: 'a@b.com', password: 'Password123' }),
      (err) => err.status === 400
    );
    await assert.rejects(
      () => service.crearRol({ correo: 'a@b.com', password: 'Password123', rol: 'superadmin' }),
      (err) => err.status === 400
    );
    await assert.rejects(
      () => service.crearRol({ correo: 'a@b.com', password: 'Password123', rol: 'cliente' }),
      (err) => err.status === 409
    );
  });
});

describe('RBAC HTTP — app real (401 sin token) y rutas protegidas (403 no-admin)', () => {
  let serverReal;
  let baseUrlReal;
  let serverTest;
  let baseUrlTest;

  const usuarios = {
    1: { id: 1, correo: 'admin@x.com', rol: 'admin', activo: true },
    2: { id: 2, correo: 'cliente@x.com', rol: 'cliente', activo: true }
  };

  before(async () => {
    serverReal = defaultApp.listen(0, '127.0.0.1');
    await new Promise((r) => serverReal.once('listening', r));
    baseUrlReal = `http://127.0.0.1:${serverReal.address().port}`;

    const middlewareToken = crearVerificarToken({
      buscarUsuarioPorId: async (id) => usuarios[id] ?? null,
      obtenerSecreto: () => SECRETO
    });

    const dummyOk = (_req, res) => res.json({ ok: true });
    const dummyCreated = (_req, res) => res.status(201).json({ ok: true });
    const noopController = {
      listar: dummyOk,
      listarHistorial: dummyOk,
      listarCatalogo: dummyOk,
      obtener: dummyOk,
      obtenerLotesDisponibles: dummyOk,
      obtenerProductos: dummyOk,
      crear: dummyCreated,
      actualizar: dummyOk,
      eliminar: (_req, res) => res.status(204).end(),
      eliminarItem: dummyOk,
      subirImagen: dummyOk,
      quitarImagen: dummyOk,
      gananciasMensuales: dummyOk,
      productosVencidos: dummyOk,
      masVendidos: dummyOk,
      promedioDiario: dummyOk,
      login: dummyOk,
      usuario: (req, res) => res.json(req.usuario),
      registrar: dummyCreated
    };

    const rolesServiceReal = crearRolesService(
      crearRolesRepository({
        query: async (sql, params) => {
          if (sql.includes('INSERT INTO usuarios')) {
            return { rows: [{ id: 15, correo: params[0], rol: params[2], activo: true }] };
          }
          return { rows: [{ id: 1, correo: 'admin@x.com', rol: 'admin', activo: true }] };
        }
      })
    );

    const testApp = crearApp({
      authRoutes: crearAuthRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      rolesRoutes: crearRolesRoutes({ controller: crearRolesController(rolesServiceReal), middlewareToken, middlewareAdmin: soloAdmin }),
      productosRoutes: crearProductosRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      lotesRoutes: crearLotesRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      ordenesCompraRoutes: crearOrdenesCompraRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      proveedoresRoutes: crearProveedoresRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      pedidosRoutes: crearPedidosRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      ventasRoutes: crearVentasRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      estadisticasRoutes: crearEstadisticasRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin }),
      tieneRoutes: crearTieneRoutes({ controller: noopController, middlewareToken, middlewareAdmin: soloAdmin })
    });

    serverTest = testApp.listen(0, '127.0.0.1');
    await new Promise((r) => serverTest.once('listening', r));
    baseUrlTest = `http://127.0.0.1:${serverTest.address().port}`;
  });

  after(async () => {
    await new Promise((r) => serverReal.close(r));
    await new Promise((r) => serverTest.close(r));
  });

  const rutasProtegidas = [
    ['GET', '/api/ordenesCompra'],
    ['GET', '/api/ordenesCompra/1'],
    ['GET', '/api/ordenesCompra/historial'],
    ['GET', '/api/lotes'],
    ['GET', '/api/lotes/1'],
    ['GET', '/api/lotes/historial'],
    ['GET', '/api/proveedores'],
    ['GET', '/api/proveedores/1'],
    ['GET', '/api/productos'],
    ['GET', '/api/productos/1'],
    ['GET', '/api/productos/historial'],
    ['GET', '/api/pedidos'],
    ['GET', '/api/pedidos/1'],
    ['GET', '/api/pedidos/1/lotes-disponibles'],
    ['GET', '/api/pedidos/historial'],
    ['GET', '/api/ventas'],
    ['GET', '/api/ventas/1'],
    ['GET', '/api/ventas/historial'],
    ['GET', '/api/estadisticas/ganancias-mensuales'],
    ['GET', '/api/roles'],
    ['POST', '/api/roles'],
    ['POST', '/api/auth/registro'],
    ['GET', '/api/items']
  ];

  it('app real devuelve 401 en todas las rutas administrativas sin token', async () => {
    for (const [metodo, ruta] of rutasProtegidas) {
      const res = await fetch(`${baseUrlReal}${ruta}`, { method: metodo });
      assert.equal(res.status, 401, `${metodo} ${ruta} debería devolver 401 y devolvió ${res.status}`);
    }
  });

  it('devuelve 403 para usuario con rol cliente en todas las rutas administrativas', async () => {
    const tokenCliente = jwt.sign({ id: 2, correo: 'cliente@x.com', rol: 'cliente' }, SECRETO, { expiresIn: '1h' });
    for (const [metodo, ruta] of rutasProtegidas) {
      const res = await fetch(`${baseUrlTest}${ruta}`, {
        method: metodo,
        headers: {
          authorization: `Bearer ${tokenCliente}`,
          'content-type': 'application/json'
        },
        body: metodo === 'POST' ? JSON.stringify({}) : undefined
      });
      assert.equal(res.status, 403, `${metodo} ${ruta} debería devolver 403 para cliente y devolvió ${res.status}`);
    }
  });

  it('permite admin en POST /api/roles sin exponer password y rechaza :id inválido con 400', async () => {
    const tokenAdmin = jwt.sign({ id: 1, correo: 'admin@x.com', rol: 'admin' }, SECRETO, { expiresIn: '1h' });

    const resCrear = await fetch(`${baseUrlTest}/api/roles`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${tokenAdmin}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ correo: 'operador@x.com', password: 'Password123', rol: 'admin' })
    });
    assert.equal(resCrear.status, 201);
    const body = await resCrear.json();
    assert.equal(body.rol, 'admin');
    assert.equal(body.password, undefined);

    const resIdInvalido = await fetch(`${baseUrlTest}/api/roles/abc`, {
      headers: { authorization: `Bearer ${tokenAdmin}` }
    });
    assert.equal(resIdInvalido.status, 400);
  });

  it('mantiene públicas GET /api/productos/catalogo y POST /api/pedidos', async () => {
    const resCat = await fetch(`${baseUrlTest}/api/productos/catalogo`);
    assert.equal(resCat.status, 200);

    const resPed = await fetch(`${baseUrlTest}/api/pedidos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(resPed.status, 201);
  });
});
