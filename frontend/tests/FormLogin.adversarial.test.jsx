// @vitest-environment jsdom
/**
 * QA ADVERSARIO — Componente FormLogin
 * ====================================
 * Ataca validación, accesibilidad, estado de envío y manipulación del formulario.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import FormLogin from '../src/features/auth/components/FormLogin.jsx'

afterEach(cleanup)

function llenar({ email = 'admin@x.com', password = 'Secreta123' } = {}) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } })
}

const enviar = () =>
  fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }).closest('form'))

beforeEach(() => {
  vi.restoreAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// 1. Contrato cumplido
// ─────────────────────────────────────────────────────────────────────────────
describe('FormLogin — contrato cumplido', () => {
  it('no llama a onIngresar con campos vacíos y enfoca el primer campo con error', () => {
    const onIngresar = vi.fn()
    render(<FormLogin onIngresar={onIngresar} />)

    enviar()

    expect(onIngresar).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText(/email/i))
  })

  it('no llama a onIngresar si falta sólo la contraseña', () => {
    const onIngresar = vi.fn()
    render(<FormLogin onIngresar={onIngresar} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@x.com' },
    })
    enviar()

    expect(onIngresar).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByLabelText(/contraseña/i))
  })

  it('envía los valores al handler cuando el formulario es válido', async () => {
    const onIngresar = vi.fn().mockResolvedValue(undefined)
    render(<FormLogin onIngresar={onIngresar} />)

    llenar({ email: 'admin@x.com', password: 'Secreta123' })
    enviar()

    await waitFor(() =>
      expect(onIngresar).toHaveBeenCalledWith({
        email: 'admin@x.com',
        password: 'Secreta123',
      }),
    )
  })

  it('muestra el error del servidor en un alert', async () => {
    const onIngresar = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))
    render(<FormLogin onIngresar={onIngresar} />)

    llenar()
    enviar()

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Credenciales inválidas',
    )
  })

  it('limpia el error del servidor al volver a escribir', async () => {
    const onIngresar = vi.fn().mockRejectedValue(new Error('Credenciales inválidas'))
    render(<FormLogin onIngresar={onIngresar} />)

    llenar()
    enviar()
    await screen.findByRole('alert')

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'otra' },
    })

    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('permite mostrar/ocultar la contraseña', () => {
    render(<FormLogin onIngresar={vi.fn()} />)
    const input = screen.getByLabelText(/contraseña/i)
    const boton = screen.getByRole('button', { name: /ver contraseña/i })

    expect(input.type).toBe('password')
    fireEvent.click(boton)
    expect(input.type).toBe('text')
    fireEvent.click(boton)
    expect(input.type).toBe('password')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hallazgos
// ─────────────────────────────────────────────────────────────────────────────
describe('Hallazgo #19 — el error del campo email nunca se renderiza', () => {
  it('debe existir un mensaje visible "Ingresá tu correo." tras enviar vacío', () => {
    render(<FormLogin onIngresar={vi.fn()} />)

    enviar()

    // Se agrega `is-invalid` al input, pero no el <div class="invalid-feedback">.
    expect(screen.queryByText(/ingresá tu correo/i)).not.toBeNull()
    expect(
      screen.getByLabelText(/email/i).getAttribute('aria-invalid'),
    ).toBe('true')
  })
})

describe('Hallazgo #20 — el input de email no es semánticamente un email', () => {
  it('debe usar type="email"', () => {
    render(<FormLogin onIngresar={vi.fn()} />)
    expect(screen.getByLabelText(/email/i).type).toBe('email')
  })

  it('debe tener autoComplete="email" o "username" (hoy: "current-email" inválido)', () => {
    render(<FormLogin onIngresar={vi.fn()} />)
    const autocomplete = screen.getByLabelText(/email/i).getAttribute('autocomplete')
    expect(['email', 'username']).toContain(autocomplete)
  })

  it('debe limitar la longitud de entrada (maxLength) contra payloads gigantes', () => {
    render(<FormLogin onIngresar={vi.fn()} />)
    expect(screen.getByLabelText(/email/i).getAttribute('maxlength')).not.toBeNull()
    expect(screen.getByLabelText(/contraseña/i).getAttribute('maxlength')).not.toBeNull()
  })
})

describe('Hallazgo #21 — el estado "enviando" no se libera si el login resuelve sin navegar', () => {
  it('el botón debe volver a habilitarse al terminar onIngresar', async () => {
    const onIngresar = vi.fn().mockResolvedValue(undefined)
    render(<FormLogin onIngresar={onIngresar} />)

    llenar()
    enviar()

    await waitFor(() => expect(onIngresar).toHaveBeenCalled())

    // Hoy: `setEnviando(false)` sólo ocurre en el catch. Si el handler resuelve
    // sin desmontar el componente (p. ej. navegación fallida), queda bloqueado.
    const boton = document.querySelector('button[type="submit"]')
    expect(boton.disabled).toBe(false)
    expect(boton.textContent).toMatch(/ingresar/i)
  })
})

describe('Hallazgo #22 — el correo se envía sin trim', () => {
  it('debe recortar espacios antes de llamar a onIngresar', async () => {
    const onIngresar = vi.fn().mockResolvedValue(undefined)
    render(<FormLogin onIngresar={onIngresar} />)

    llenar({ email: '   admin@x.com   ', password: 'Secreta123' })
    enviar()

    await waitFor(() => expect(onIngresar).toHaveBeenCalled())
    expect(onIngresar).toHaveBeenCalledWith({
      email: 'admin@x.com',
      password: 'Secreta123',
    })
  })
})

describe('Hallazgo #23 — doble submit programático', () => {
  it('dos submits en el mismo tick sólo deben disparar una petición', async () => {
    let resolver
    const onIngresar = vi.fn(
      () => new Promise((resolve) => { resolver = resolve }),
    )
    render(<FormLogin onIngresar={onIngresar} />)

    llenar()
    const form = screen.getByRole('button', { name: /ingresar/i }).closest('form')

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(onIngresar).toHaveBeenCalledTimes(1)
    resolver()
  })
})

describe('Hallazgo #24 — campos sin atributo required', () => {
  it('los inputs deben exponer `required` para validación nativa y lectores de pantalla', () => {
    render(<FormLogin onIngresar={vi.fn()} />)
    expect(screen.getByLabelText(/email/i).required).toBe(true)
    expect(screen.getByLabelText(/contraseña/i).required).toBe(true)
  })
})
