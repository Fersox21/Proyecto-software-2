import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { crearApp } from '../src/app.js';
import { crearAuthRepository } from '../src/modules/auth/auth.repository.js';
import { crearAuthService } from '../src/modules/auth/auth.service.js';
import { crearAuthController } from '../src/modules/auth/auth.controller.js';
import { crearAuthRoutes } from '../src/modules/auth/auth.routes.js';
import { crearRateLimiterLogin } from '../src/modules/auth/auth.rateLimit.js';
import { crearVerificarToken, soloAdmin } from '../src/middlewares/verificarToken.js';

const SECRETO = 'test-secret';
const PASSWORD = 'Secreta123';
const CORREO = 'admin@distribuidora.com';

let server;
let baseUrl;
let hashValido;
let queryImpl;
let rateLimiter;

const usuarioBase = {
  id: 7,
  correo: CORREO,
  rol: 'admin',
  activo: true
};

const fakePool = {
  query: async (sql, params) => queryImpl(sql, params)
};

const authRepo = crearAuthRepository(fakePool);
const authService = crearAuthService({
  repository: authRepo,
  obtenerJwtSecret: () => SECRETO,
  obtenerJwtExpiresIn: () => '1h'
});
const authController = crearAuthController(authService);
const verificarTokenTest = crearVerificarToken({
  buscarUsuarioPorId: authRepo.obtenerUsuarioPorId,
  obtenerSecreto: () => SECRETO
});

function simularErrorPg(codigo, mensaje) {
  const error = new Error(mensaje);
  error.code = codigo;
  error.severity = 'ERROR';
  return error;
}

async function postLogin(body, { contentType = 'application/json', raw } = {}) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: contentType ? { 'content-type': contentType } : {},
    body: raw ?? JSON.stringify(body)
  });
}

async function postRegistro(body, { raw, token } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = token;
  return fetch(`${baseUrl}/api/auth/registro`, {
    method: 'POST',
    headers,
    body: raw ?? JSON.stringify(body)
  });
}

async function getUsuario(token) {
  return fetch(`${baseUrl}/api/auth/usuario`, {
    headers: token === null ? {} : { authorization: token }
  });
}

const firmar = (payload, opciones = {}) =>
  jwt.sign(payload, SECRETO, { expiresIn: '1h', ...opciones });

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

before(async () => {
  hashValido = await bcrypt.hash(PASSWORD, 4);
  usuarioBase.password = hashValido;

  rateLimiter = crearRateLimiterLogin({ maxIntentos: 15, ventanaMs: 60_000 });
  const authRoutes = crearAuthRoutes({
    controller: authController,
    middlewareToken: verificarTokenTest,
    middlewareAdmin: soloAdmin,
    rateLimiter
  });
  const app = crearApp({ authRoutes });

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  rateLimiter.reiniciar();
  queryImpl = async (sql, params) => {
    if (typeof sql === 'string' && sql.includes('FROM usuarios')) {
      if (sql.includes('WHERE id = $1')) {
        const id = params?.[0];
        return { rows: id === usuarioBase.id ? [{ ...usuarioBase }] : [] };
      }
      const correo = params?.[0];
      return { rows: correo === CORREO ? [{ ...usuarioBase }] : [] };
    }
    return { rows: [] };
  };
});

describe('Login — contrato cumplido', () => {
  it('credenciales válidas devuelven 200 y un JWT con id, correo y rol (sin password)', async () => {
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(typeof body.token, 'string');
    assert.deepEqual(body.usuario, { id: 7, correo: CORREO, rol: 'admin' });

    const payload = jwt.verify(body.token, SECRETO);
    assert.equal(payload.id, usuarioBase.id);
    assert.equal(payload.correo, CORREO);
    assert.equal(payload.rol, 'admin');
    assert.equal(payload.password, undefined);
  });

  it('acepta el alias email en el body', async () => {
    const res = await postLogin({ email: CORREO, password: PASSWORD });
    assert.equal(res.status, 200);
  });

  it('contraseña incorrecta devuelve 401 con el contrato de error de AGENTS.md', async () => {
    const res = await postLogin({ correo: CORREO, password: 'incorrecta' });
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error, 'Credenciales inválidas');
    assert.equal(body.statusCode, 401);
  });

  it('usuario inexistente devuelve el mismo mensaje que contraseña incorrecta', async () => {
    const res = await postLogin({ correo: 'nadie@x.com', password: PASSWORD });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'Credenciales inválidas');
  });

  it('inyección SQL en correo no autentica', async () => {
    const res = await postLogin({ correo: "' OR '1'='1", password: PASSWORD });
    assert.equal(res.status, 401);
  });

  it('JSON malformado devuelve 400 con contrato estructurado, no 500', async () => {
    const res = await postLogin(null, { raw: '{"correo":' });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.statusCode, 400);
  });

  it('body mayor a 100 kb devuelve 413', async () => {
    const res = await postLogin({ correo: CORREO, password: 'a'.repeat(200_000) });
    assert.equal(res.status, 413);
  });

  it('método no soportado sobre /login devuelve 404 estructurado', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.statusCode, 404);
  });
});

describe('Validación de entradas y seguridad — Hallazgos resueltos', () => {
  it('POST {} responde 400 con mensaje que menciona correo y contraseña', async () => {
    const res = await postLogin({});
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.statusCode, 400);
    assert.match(body.error, /correo/i);
    assert.match(body.error, /contrase/i);
  });

  it('body enviado como text/plain responde 400, no 500', async () => {
    const res = await postLogin({ correo: CORREO, password: PASSWORD }, { contentType: 'text/plain' });
    assert.equal(res.status, 400);
  });

  for (const [tipo, password] of [
    ['array', ['Secreta123']],
    ['null', null],
    ['número', 12345678],
    ['objeto', { $ne: null }],
    ['booleano', false]
  ]) {
    it(`password de tipo ${tipo} responde 400`, async () => {
      const res = await postLogin({ correo: CORREO, password });
      assert.equal(res.status, 400);
    });
  }

  it('correo array responde 400 antes de tocar PostgreSQL', async () => {
    queryImpl = async () => {
      throw simularErrorPg('42883', 'operator does not exist');
    };
    const res = await postLogin({ correo: [CORREO], password: PASSWORD });
    assert.equal(res.status, 400);
  });

  it('correo con byte nulo responde 400 antes de tocar PostgreSQL', async () => {
    queryImpl = async () => {
      throw simularErrorPg('22021', 'invalid byte sequence');
    };
    const res = await postLogin({ correo: 'admin\u0000@x.com', password: PASSWORD });
    assert.equal(res.status, 400);
  });

  it('correo objeto responde 400', async () => {
    const res = await postLogin({ correo: { $gt: '' }, password: PASSWORD });
    assert.equal(res.status, 400);
  });

  it('usuario con password NULL devuelve 401, no 500', async () => {
    queryImpl = async () => ({ rows: [{ ...usuarioBase, password: null }] });
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    assert.equal(res.status, 401);
  });

  it('usuario con hash no-bcrypt devuelve 401, no 500', async () => {
    queryImpl = async () => ({ rows: [{ ...usuarioBase, password: 'texto-plano' }] });
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    assert.equal(res.status, 401);
  });

  it('login ignora espacios y mayúsculas/minúsculas en correo', async () => {
    const res1 = await postLogin({ correo: `  ${CORREO}  `, password: PASSWORD });
    assert.equal(res1.status, 200);

    const res2 = await postLogin({ correo: CORREO.toUpperCase(), password: PASSWORD });
    assert.equal(res2.status, 200);
  });

  it('dos contraseñas distintas >72 bytes no autentican igual', async () => {
    const base72 = 'A'.repeat(72);
    const hashLargo = await bcrypt.hash(`${base72}X`, 4);
    queryImpl = async () => ({ rows: [{ ...usuarioBase, password: hashLargo }] });

    const res = await postLogin({ correo: CORREO, password: `${base72}Y` });
    assert.equal(res.status, 401);
  });

  it('usuario con activo=false no puede iniciar sesión (403)', async () => {
    queryImpl = async () => ({ rows: [{ ...usuarioBase, activo: false }] });
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    assert.ok([401, 403].includes(res.status));
  });

  it('token de usuario inexistente/desactivado es rechazado en /usuario', async () => {
    const res = await getUsuario(`Bearer ${firmar({ id: 999, correo: 'fantasma@x.com', rol: 'admin' })}`);
    assert.ok([401, 403].includes(res.status));
  });

  it('fuerza bruta devuelve 429 tras exceder intentos fallidos', async () => {
    const respuestas = [];
    for (let i = 0; i < 20; i += 1) {
      const res = await postLogin({ correo: CORREO, password: `mala-${i}` });
      respuestas.push(res.status);
    }
    assert.ok(respuestas.includes(429));
  });

  it('login incluye rol del usuario en body y JWT', async () => {
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.usuario?.rol, 'admin');
  });

  it('POST /registro sin token responde 401 y con rol cliente responde 403', async () => {
    const resSinToken = await postRegistro({ correo: 'intruso@x.com', password: 'Secreta123' });
    assert.equal(resSinToken.status, 401);

    queryImpl = async (sql, params) => {
      if (sql.includes('WHERE id = $1')) {
        return { rows: [{ id: 8, correo: 'cliente@x.com', rol: 'cliente', activo: true }] };
      }
      return { rows: [] };
    };
    const resCliente = await postRegistro(
      { correo: 'intruso@x.com', password: 'Secreta123' },
      { token: `Bearer ${firmar({ id: 8, correo: 'cliente@x.com', rol: 'cliente' })}` }
    );
    assert.equal(resCliente.status, 403);
  });

  it('POST /registro con admin valida correo, password, longitud y rol', async () => {
    const adminToken = `Bearer ${firmar({ id: 7, correo: CORREO, rol: 'admin' })}`;

    const resMalCorreo = await postRegistro({ correo: 'no-es-un-correo', password: 'Secreta123' }, { token: adminToken });
    assert.equal(resMalCorreo.status, 400);

    const resCorta = await postRegistro({ correo: 'corto@x.com', password: '123' }, { token: adminToken });
    assert.equal(resCorta.status, 400);

    const resNoString = await postRegistro({ correo: 'x@x.com', password: 12345678 }, { token: adminToken });
    assert.equal(resNoString.status, 400);

    const resLargo = await postRegistro({ correo: `${'a'.repeat(60)}@x.com`, password: 'Secreta123' }, { token: adminToken });
    assert.equal(resLargo.status, 400);

    let insertArgs = null;
    queryImpl = async (sql, params) => {
      if (sql.includes('WHERE id = $1')) return { rows: [{ ...usuarioBase }] };
      if (sql.includes('INSERT INTO usuarios')) {
        insertArgs = params;
        return { rows: [{ id: 22, correo: params[0], rol: params[2], activo: true }] };
      }
      return { rows: [] };
    };

    const resOk = await postRegistro({ correo: 'nuevo@x.com', password: 'Secreta123', rol: 'cliente' }, { token: adminToken });
    assert.equal(resOk.status, 201);
    const bodyOk = await resOk.json();
    assert.equal(bodyOk.rol, 'cliente');
    assert.equal(bodyOk.password, undefined);
    assert.equal(insertArgs[2], 'cliente');
  });

  it('un 500 de PostgreSQL no filtra detalles internos al cliente', async () => {
    queryImpl = async () => {
      throw new Error('password authentication failed for user "postgres"');
    };
    const res = await postLogin({ correo: CORREO, password: PASSWORD });
    const body = await res.json();
    assert.equal(res.status, 500);
    assert.doesNotMatch(JSON.stringify(body), /password authentication failed/i);
  });
});

describe('Middleware verificarToken y soloAdmin', () => {
  it('sin header devuelve 401 y no llama a next', async () => {
    const req = { headers: {} };
    const res = mockRes();
    let llamado = false;

    await verificarTokenTest(req, res, () => { llamado = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(llamado, false);
  });

  it('token vencido devuelve "Token vencido"', async () => {
    const req = { headers: { authorization: `Bearer ${firmar({ id: 7 }, { expiresIn: -10 })}` } };
    const res = mockRes();
    await verificarTokenTest(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, 'Token vencido');
  });

  it('firma con otro secreto devuelve "Token inválido"', async () => {
    const token = jwt.sign({ id: 7 }, 'otro-secreto', { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    await verificarTokenTest(req, res, () => {});
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, 'Token inválido');
  });

  it('token con alg:none es rechazado', async () => {
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const token = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 7 })}.`;
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let llamado = false;
    await verificarTokenTest(req, res, () => { llamado = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(llamado, false);
  });

  it('esquema "bearer" en minúsculas es aceptado', async () => {
    const token = firmar({ id: 7, correo: CORREO, rol: 'admin' });
    const req = { headers: { authorization: `bearer ${token}` } };
    const res = mockRes();
    let llamado = false;
    await verificarTokenTest(req, res, () => { llamado = true; });
    assert.equal(llamado, true);
    assert.equal(res.statusCode, null);
    assert.deepEqual(req.usuario, { id: 7, correo: CORREO, rol: 'admin' });
  });

  it('JWT sin id o con id tipo objeto es rechazado con 401', async () => {
    const resSinId = mockRes();
    await verificarTokenTest({ headers: { authorization: `Bearer ${firmar({ correo: CORREO })}` } }, resSinId, () => {});
    assert.equal(resSinId.statusCode, 401);

    const resObjId = mockRes();
    await verificarTokenTest({ headers: { authorization: `Bearer ${firmar({ id: { $ne: null }, correo: CORREO })}` } }, resObjId, () => {});
    assert.equal(resObjId.statusCode, 401);
  });

  it('soloAdmin rechaza rol cliente con 403 y permite rol admin', () => {
    const res = mockRes();
    let llamado = false;
    soloAdmin({ usuario: { id: 8, correo: 'c@x.com', rol: 'cliente' } }, res, () => { llamado = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.success, false);
    assert.equal(llamado, false);

    const resAdmin = mockRes();
    let llamadoAdmin = false;
    soloAdmin({ usuario: { id: 7, correo: CORREO, rol: 'admin' } }, resAdmin, () => { llamadoAdmin = true; });
    assert.equal(llamadoAdmin, true);
  });
});

describe('GET /api/auth/usuario', () => {
  it('token válido devuelve id, correo y rol (nunca password)', async () => {
    const res = await getUsuario(`Bearer ${firmar({ id: 7, correo: CORREO, rol: 'admin' })}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { id: 7, correo: CORREO, rol: 'admin' });
    assert.equal(body.password, undefined);
  });

  it('sin header devuelve 401', async () => {
    const res = await getUsuario(null);
    assert.equal(res.status, 401);
  });
});
