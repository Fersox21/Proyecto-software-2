/**
 * QA ADVERSARIO — Módulo de login (backend)
 * =========================================
 * Objetivo: romper el flujo de autenticación, no validar el happy path.
 *
 * Convención de lectura:
 *   describe('Contrato cumplido')  -> hoy debería estar en VERDE.
 *   describe('Hallazgo #N')        -> test que exige el comportamiento SEGURO.
 *                                     Si falla, el defecto está confirmado en el código.
 *
 * Se mockean `config/db.js` y `config/env.js` para no tocar la base real ni
 * leer secretos: la suite nunca abre una conexión a PostgreSQL.
 */
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }))

vi.mock('../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h',
    CORS_ORIGIN: 'http://localhost:5173',
  },
}))

vi.mock('../src/config/db.js', () => ({
  pool: {
    query: queryMock,
    on: vi.fn(),
    end: vi.fn(),
  },
}))

const { default: app } = await import('../src/app.js')
const { verificarToken } = await import('../src/middlewares/verificarToken.js')

const SECRETO = 'test-secret'
const PASSWORD = 'Secreta123'

let server
let baseUrl
let hashValido

const CORREO = 'admin@distribuidora.com'
const usuarioBase = {
  id: 7,
  correo: CORREO,
  rol: 'admin',
  activo: true,
}

beforeAll(async () => {
  hashValido = await bcrypt.hash(PASSWORD, 4) // coste bajo: sólo test
  usuarioBase.password = hashValido

  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

beforeEach(() => {
  queryMock.mockReset()
  queryMock.mockImplementation(async (sql, params) => {
    if (typeof sql === 'string' && sql.includes('FROM roles')) {
      const correo = params?.[0]
      return { rows: correo === CORREO ? [{ ...usuarioBase }] : [] }
    }
    return { rows: [] }
  })
})

/** Simula un error real de PostgreSQL (pg no valida tipos; lo hace el server). */
function simularErrorPg(codigo, mensaje) {
  const error = new Error(mensaje)
  error.code = codigo
  error.severity = 'ERROR'
  return error
}

async function postLogin(body, { contentType = 'application/json', raw } = {}) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: contentType ? { 'content-type': contentType } : {},
    body: raw ?? JSON.stringify(body),
  })
}

async function postRegistro(body, { raw } = {}) {
  return fetch(`${baseUrl}/api/auth/registro`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ?? JSON.stringify(body),
  })
}

async function getUsuario(token) {
  return fetch(`${baseUrl}/api/auth/usuario`, {
    headers: token === null ? {} : { authorization: token },
  })
}

const firmar = (payload, opciones = {}) =>
  jwt.sign(payload, SECRETO, { expiresIn: '1h', ...opciones })

// ─────────────────────────────────────────────────────────────────────────────
// 1. Contrato que HOY se cumple (regresión: si esto se rompe, es peor)
// ─────────────────────────────────────────────────────────────────────────────
describe('Login — contrato cumplido', () => {
  it('credenciales válidas devuelven 200 y un JWT con id/correo (sin password)', async () => {
    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(typeof body.token).toBe('string')

    const payload = jwt.verify(body.token, SECRETO)
    expect(payload.id).toBe(usuarioBase.id)
    expect(payload.correo).toBe(CORREO)
    expect(payload.password).toBeUndefined()
  })

  it('acepta el alias `email` en el body', async () => {
    const res = await postLogin({ email: CORREO, password: PASSWORD })
    expect(res.status).toBe(200)
  })

  it('contraseña incorrecta devuelve 401 con el contrato de error del AGENTS.md', async () => {
    const res = await postLogin({ correo: CORREO, password: 'incorrecta' })
    expect(res.status).toBe(401)

    const body = await res.json()
    expect(body).toMatchObject({
      success: false,
      error: 'Credenciales inválidas',
      statusCode: 401,
    })
  })

  it('usuario inexistente devuelve el MISMO mensaje que contraseña incorrecta (no enumera)', async () => {
    const res = await postLogin({ correo: 'nadie@x.com', password: PASSWORD })
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe('Credenciales inválidas')
  })

  it('inyección SQL en correo no autentica', async () => {
    const res = await postLogin({ correo: "' OR '1'='1", password: PASSWORD })
    expect(res.status).toBe(401)
  })

  it('JSON malformado devuelve 400 (body-parser), no 500', async () => {
    const res = await postLogin(null, { raw: '{"correo":' })
    expect(res.status).toBe(400)
  })

  it('body mayor a 100 kb devuelve 413 y no tumba el proceso', async () => {
    const res = await postLogin({ correo: CORREO, password: 'a'.repeat(200_000) })
    expect(res.status).toBe(413)
  })

  it('un método no soportado sobre /login devuelve 404 estructurado', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`)
    expect(res.status).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Validación de entradas — Hallazgos
// ─────────────────────────────────────────────────────────────────────────────
describe('Hallazgo #1 — body vacío debe ser 400, no 500', () => {
  it('POST {} responde 400 con mensaje que mencione correo y contraseña', async () => {
    const res = await postLogin({})
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.statusCode).toBe(400)
    expect(body.message).toMatch(/correo/i)
    expect(body.message).toMatch(/contrase/i) // el mensaje actual dice "Mail y correo"
  })
})

describe('Hallazgo #2 — Content-Type ausente/no JSON no debe explotar', () => {
  it('body JSON enviado como text/plain responde 400 (hoy: TypeError -> 500)', async () => {
    const res = await postLogin(
      { correo: CORREO, password: PASSWORD },
      { contentType: 'text/plain' },
    )
    expect(res.status).toBe(400)
  })
})

describe('Hallazgo #3 — tipos no string en password', () => {
  it.each([
    ['array', ['Secreta123']],
    ['null', null],
    ['número', 12345678],
    ['objeto', { $ne: null }],
    ['booleano', false],
  ])('password de tipo %s responde 400 (hoy: 500 por bcrypt)', async (_tipo, password) => {
    const res = await postLogin({ correo: CORREO, password })
    expect(res.status).toBe(400)
  })
})

describe('Hallazgo #4 — tipos no string en correo llegan crudos a PostgreSQL', () => {
  it('correo array → pg lanza 42883 → debe responder 400 (hoy: 500)', async () => {
    queryMock.mockRejectedValueOnce(
      simularErrorPg('42883', 'operator does not exist: character varying = text[]'),
    )

    const res = await postLogin({ correo: [CORREO], password: PASSWORD })
    expect(res.status).toBe(400)
  })

  it('correo con byte nulo → pg lanza 22021 → debe responder 400 (hoy: 500)', async () => {
    queryMock.mockRejectedValueOnce(
      simularErrorPg('22021', 'invalid byte sequence for encoding "UTF8": 0x00'),
    )

    const res = await postLogin({ correo: 'admin\u0000@x.com', password: PASSWORD })
    expect(res.status).toBe(400)
  })

  it('correo objeto → debe responder 400 (hoy: 500 o bypass de tipo)', async () => {
    queryMock.mockRejectedValueOnce(
      simularErrorPg('22P02', 'invalid input syntax for type json'),
    )

    const res = await postLogin({ correo: { $gt: '' }, password: PASSWORD })
    expect(res.status).toBe(400)
  })
})

describe('Hallazgo #5 — fila con password nulo/corrupto rompe con 500', () => {
  it('usuario con password NULL debe dar 401, no 500', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ ...usuarioBase, password: null }] })
    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    expect(res.status).toBe(401)
  })

  it('usuario con hash no-bcrypt debe dar 401, no 500', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ ...usuarioBase, password: 'texto-plano' }] })
    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    expect(res.status).toBe(401)
  })
})

describe('Hallazgo #6 — normalización de correo', () => {
  it('login debe ignorar espacios alrededor del correo', async () => {
    const res = await postLogin({ correo: `  ${CORREO}  `, password: PASSWORD })
    expect(res.status).toBe(200)
  })

  it('login debe ser case-insensitive (hoy el correo en mayúsculas da 401)', async () => {
    const res = await postLogin({ correo: CORREO.toUpperCase(), password: PASSWORD })
    expect(res.status).toBe(200)
  })
})

describe('Hallazgo #7 — bcrypt trunca a 72 bytes', () => {
  it('dos contraseñas distintas que comparten los primeros 72 bytes NO deben autenticar igual', async () => {
    const base72 = 'A'.repeat(72)
    const hashLargo = await bcrypt.hash(`${base72}X`, 4)
    queryMock.mockResolvedValueOnce({ rows: [{ ...usuarioBase, password: hashLargo }] })

    const res = await postLogin({ correo: CORREO, password: `${base72}Y` })
    expect(res.status).toBe(401)
  })
})

describe('Hallazgo #8 — usuarios desactivados', () => {
  it('activo=false no debe poder iniciar sesión', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ ...usuarioBase, activo: false }] })
    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    expect([401, 403]).toContain(res.status)
  })

  it('el token de un usuario desactivado no debe seguir sirviendo en /usuario', async () => {
    // /usuario no consulta la BD: el JWT es la única fuente de verdad.
    const res = await getUsuario(`Bearer ${firmar({ id: 999, correo: 'fantasma@x.com' })}`)
    expect([401, 403]).toContain(res.status)
  })
})

describe('Hallazgo #9 — fuerza bruta sin límite', () => {
  it('N intentos fallidos seguidos deben terminar en 429', async () => {
    const respuestas = []
    for (let i = 0; i < 25; i += 1) {
      const res = await postLogin({ correo: CORREO, password: `mala-${i}` })
      respuestas.push(res.status)
    }
    expect(respuestas).toContain(429)
  })
})

describe('Hallazgo #10 — la respuesta de login no permite distinguir roles', () => {
  it('el body debe incluir el rol del usuario (hoy sólo { token })', async () => {
    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    const body = await res.json()
    expect(body.usuario?.rol ?? body.rol).toBe('admin')
  })
})

describe('Hallazgo #11 — el registro público permite crear administradores', () => {
  it('POST /registro sin token debe responder 401 (hoy: 201)', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, correo: 'intruso@x.com' }] })
    const res = await postRegistro({ correo: 'intruso@x.com', password: 'Secreta123' })
    expect(res.status).toBe(401)
  })

  it('rechaza correos sin formato válido', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, correo: 'no-es-un-correo' }] })
    const res = await postRegistro({ correo: 'no-es-un-correo', password: 'Secreta123' })
    expect(res.status).toBe(400)
  })

  it('rechaza contraseñas de menos de 8 caracteres (roles.service ya lo exige)', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, correo: 'corto@x.com' }] })
    const res = await postRegistro({ correo: 'corto@x.com', password: '123' })
    expect(res.status).toBe(400)
  })

  it('password no string responde 400 (hoy: bcrypt.hash lanza -> 500)', async () => {
    const res = await postRegistro({ correo: 'x@x.com', password: 12345678 })
    expect(res.status).toBe(400)
  })

  it('correo que excede VARCHAR(50) responde 400 (hoy: 500 por 22001)', async () => {
    queryMock.mockRejectedValueOnce(
      simularErrorPg('22001', 'value too long for type character varying(50)'),
    )
    const res = await postRegistro({
      correo: `${'a'.repeat(60)}@x.com`,
      password: 'Secreta123',
    })
    expect(res.status).toBe(400)
  })
})

describe('Hallazgo #12 — un 500 no debe filtrar detalles internos', () => {
  it('el mensaje de error de PostgreSQL no debe llegar al cliente', async () => {
    queryMock.mockRejectedValueOnce(
      new Error('password authentication failed for user "postgres"'),
    )

    const res = await postLogin({ correo: CORREO, password: PASSWORD })
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(JSON.stringify(body)).not.toMatch(/password authentication failed/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Middleware verificarToken
// ─────────────────────────────────────────────────────────────────────────────
function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
  return res
}

describe('verificarToken — contrato cumplido', () => {
  it('sin header devuelve 401 estructurado y NO llama a next', () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = vi.fn()

    verificarToken(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res.body).toMatchObject({ success: false, statusCode: 401 })
    expect(next).not.toHaveBeenCalled()
  })

  it('token vencido devuelve "Token vencido"', () => {
    const req = {
      headers: { authorization: `Bearer ${firmar({ id: 1 }, { expiresIn: -10 })}` },
    }
    const res = mockRes()

    verificarToken(req, res, vi.fn())

    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe('Token vencido')
  })

  it('firma con otro secreto devuelve "Token inválido"', () => {
    const token = jwt.sign({ id: 1 }, 'otro-secreto', { expiresIn: '1h' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()

    verificarToken(req, res, vi.fn())

    expect(res.statusCode).toBe(401)
    expect(res.body.error).toBe('Token inválido')
  })

  it('token con alg:none es rechazado', () => {
    const b64 = (obj) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url')
    const token = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 1 })}.`
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = vi.fn()

    verificarToken(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('"Bearer" sin token devuelve 401', () => {
    const res = mockRes()
    verificarToken({ headers: { authorization: 'Bearer' } }, res, vi.fn())
    expect(res.statusCode).toBe(401)
  })

  it('"Bearer " (sólo espacio) devuelve 401', () => {
    const res = mockRes()
    verificarToken({ headers: { authorization: 'Bearer ' } }, res, vi.fn())
    expect(res.statusCode).toBe(401)
  })

  it('token válido con id/correo llama a next y puebla req.usuario', () => {
    const req = { headers: { authorization: `Bearer ${firmar({ id: 7, correo: CORREO })}` } }
    const next = vi.fn()

    verificarToken(req, mockRes(), next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.usuario).toEqual({ id: 7, correo: CORREO })
  })
})

describe('verificarToken — hallazgos', () => {
  it('el esquema "bearer" en minúsculas debe aceptarse (RFC 7235 es case-insensitive)', () => {
    const token = firmar({ id: 7, correo: CORREO })
    const req = { headers: { authorization: `bearer ${token}` } }
    const next = vi.fn()
    const res = mockRes()

    verificarToken(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.statusCode).toBeNull()
  })

  it('un JWT firmado pero SIN id en el payload debe rechazarse', () => {
    const token = firmar({ correo: CORREO }) // falta id
    const req = { headers: { authorization: `Bearer ${token}` } }
    const next = vi.fn()
    const res = mockRes()

    verificarToken(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('un JWT con id de tipo objeto debe rechazarse', () => {
    const token = firmar({ id: { $ne: null }, correo: CORREO })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const next = vi.fn()

    verificarToken(req, mockRes(), next)

    expect(next).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /api/auth/usuario
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/auth/usuario', () => {
  it('token válido devuelve sólo id y correo (nunca el hash)', async () => {
    const res = await getUsuario(`Bearer ${firmar({ id: 7, correo: CORREO })}`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({ id: 7, correo: CORREO })
    expect(body.password).toBeUndefined()
  })

  it('sin header devuelve 401', async () => {
    const res = await getUsuario(null)
    expect(res.status).toBe(401)
  })
})
