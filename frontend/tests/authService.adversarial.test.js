/**
 * QA ADVERSARIO — Servicio de autenticación del frontend
 * =====================================================
 * Cubre `features/auth/services/authService.js`: contrato del token,
 * almacenamiento, expiración, caídas de red y carreras entre peticiones.
 *
 * `sessionStorage` y `fetch` se sustituyen por dobles: ningún test sale a red.
 */
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vitest'
import {
  iniciarSesion,
  obtenerUsuario,
  obtenerSesion,
  protegerRuta,
  redirigirSiHaySesion,
  cerrarSesion,
} from '../src/features/auth/services/authService.js'

class MemoryStorage {
  constructor() {
    this.mapa = new Map()
  }
  getItem(clave) {
    return this.mapa.has(clave) ? this.mapa.get(clave) : null
  }
  setItem(clave, valor) {
    this.mapa.set(clave, String(valor))
  }
  removeItem(clave) {
    this.mapa.delete(clave)
  }
  clear() {
    this.mapa.clear()
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

beforeEach(() => {
  vi.stubGlobal('sessionStorage', new MemoryStorage())
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────
// 1. Contrato cumplido
// ─────────────────────────────────────────────────────────────────────────────
describe('authService — contrato cumplido', () => {
  it('login exitoso guarda el token en sessionStorage', async () => {
    fetch.mockResolvedValueOnce(json({ token: 'jwt-valido' }))

    await iniciarSesion({ email: 'admin@x.com', password: 'Secreta123' })

    expect(obtenerSesion()).toBe('jwt-valido')
  })

  it('envía correo y contraseña sin transformarlos (unicode intacto)', async () => {
    fetch.mockResolvedValueOnce(json({ token: 't' }))
    const email = 'ñandú.测试+tag@example.com'

    await iniciarSesion({ email, password: '🔐 contraseña' })

    const [url, opciones] = fetch.mock.calls[0]
    expect(url).toContain('/api/auth/login')
    expect(JSON.parse(opciones.body)).toEqual({
      email,
      password: '🔐 contraseña',
    })
  })

  it('401 del backend propaga el mensaje del servidor', async () => {
    fetch.mockResolvedValueOnce(json({ error: 'Credenciales inválidas' }, 401))

    await expect(
      iniciarSesion({ email: 'a@a.com', password: 'x' }),
    ).rejects.toThrow('Credenciales inválidas')
    expect(obtenerSesion()).toBeNull()
  })

  it('backend caído (fetch rechaza) propaga un TypeError', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(
      iniciarSesion({ email: 'a@a.com', password: 'x' }),
    ).rejects.toBeInstanceOf(TypeError)
  })

  it('obtenerUsuario sin token devuelve null y NO llama a fetch', async () => {
    await expect(obtenerUsuario()).resolves.toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('obtenerUsuario con 401 borra el token y adjunta el status', async () => {
    sessionStorage.setItem('token', 'viejo')
    fetch.mockResolvedValueOnce(json({ error: 'Token vencido' }, 401))

    await expect(obtenerUsuario()).rejects.toMatchObject({ status: 401 })
    expect(obtenerSesion()).toBeNull()
  })

  it('protegerRuta sin token lanza redirección a /login', async () => {
    let error
    try {
      await protegerRuta()
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Response)
    expect(error.headers.get('location')).toContain('/login')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('protegerRuta conserva el token si la API falla por red (no cierra sesión)', async () => {
    sessionStorage.setItem('token', 'valido')
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(protegerRuta()).rejects.toBeInstanceOf(TypeError)
    expect(obtenerSesion()).toBe('valido')
  })

  it('cerrarSesion elimina el token', () => {
    sessionStorage.setItem('token', 'x')
    cerrarSesion()
    expect(obtenerSesion()).toBeNull()
  })

  it('redirigirSiHaySesion sin token devuelve null (deja ver el login)', () => {
    expect(redirigirSiHaySesion()).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos
// ─────────────────────────────────────────────────────────────────────────────
describe('Hallazgo #13 — respuesta 200 sin token', () => {
  it('no debe guardar la cadena "undefined" como sesión', async () => {
    fetch.mockResolvedValueOnce(json({})) // 200, pero sin token

    await expect(
      iniciarSesion({ email: 'a@a.com', password: 'x' }),
    ).rejects.toThrow(/token/i)

    expect(obtenerSesion()).not.toBe('undefined')
  })
})

describe('Hallazgo #14 — error no-JSON del proxy/backend', () => {
  it('un 502 HTML debe dar un Error legible, no un SyntaxError de JSON.parse', async () => {
    fetch.mockResolvedValueOnce(
      new Response('<html><body>Bad Gateway</body></html>', {
        status: 502,
        headers: { 'content-type': 'text/html' },
      }),
    )

    let error
    try {
      await iniciarSesion({ email: 'a@a.com', password: 'x' })
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Error)
    expect(error).not.toBeInstanceOf(SyntaxError)
    expect(error.message).not.toMatch(/json|unexpected token|<!doctype/i)
  })
})

describe('Hallazgo #15 — sessionStorage lleno o bloqueado', () => {
  it('si setItem lanza QuotaExceeded, el login debe informar un error de sesión', async () => {
    fetch.mockResolvedValueOnce(json({ token: 'jwt' }))
    sessionStorage.setItem = () => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    }

    await expect(
      iniciarSesion({ email: 'a@a.com', password: 'x' }),
    ).rejects.toThrow(/sesi[oó]n|almacen|storage/i)
  })
})

describe('Hallazgo #16 — carrera entre dos logins concurrentes', () => {
  it('la respuesta más vieja no debe pisar el token de la más nueva', async () => {
    let resolverPrimera
    let resolverSegunda

    fetch
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolverPrimera = resolve }),
      )
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolverSegunda = resolve }),
      )

    const primera = iniciarSesion({ email: 'a@a.com', password: 'x' })
    const segunda = iniciarSesion({ email: 'b@b.com', password: 'x' })

    // La segunda termina primero...
    resolverSegunda(json({ token: 'TOKEN_NUEVO' }))
    await segunda

    // ...y la primera (stale) llega tarde.
    resolverPrimera(json({ token: 'TOKEN_VIEJO' }))
    await primera

    expect(obtenerSesion()).toBe('TOKEN_NUEVO')
  })
})

describe('Hallazgo #17 — redirección a ciegas con token basura', () => {
  it('un token inválido/vencido no debe mandar a /administrador (rebote login↔admin)', () => {
    sessionStorage.setItem('token', 'esto.no.es.un.jwt')

    let redirigio = false
    try {
      redirigirSiHaySesion()
    } catch (e) {
      redirigio = e instanceof Response
    }

    expect(redirigio).toBe(false)
  })
})

describe('Hallazgo #18 — 200 con payload inválido en /usuario', () => {
  it('un cuerpo que no es JSON válido debe rechazar, no devolver {} como usuario', async () => {
    sessionStorage.setItem('token', 'jwt')
    fetch.mockResolvedValueOnce(
      new Response('no-json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    )

    await expect(obtenerUsuario()).rejects.toThrow()
  })

  it('un usuario sin id debe rechazar la sesión', async () => {
    sessionStorage.setItem('token', 'jwt')
    fetch.mockResolvedValueOnce(json({ correo: 'a@a.com' }))

    await expect(obtenerUsuario()).rejects.toThrow()
  })
})
