import { esRequerido } from "../../../shared/utils/validaciones"
import Boton from '../../../shared/components/Boton'
import { useRef, useState } from 'react'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 254
const MAX_PASSWORD_LEN = 128

function validar(valor) {
  const errores = {}
  const emailLimpio = String(valor.email ?? '').trim()
  if (!esRequerido(emailLimpio)) {
    errores.email = 'Ingresá tu correo.'
  } else if (!REGEX_EMAIL.test(emailLimpio)) {
    errores.email = 'Ingresá un correo válido.'
  }
  if (!esRequerido(valor.password)) errores.password = 'Ingresá tu contraseña.'
  return errores
}


function FormLogin({ onIngresar }) {

  const [valores, setValores] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const formularioRef = useRef(null)
  const enviandoRef = useRef(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValores({ ...valores, [name]: value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
    setErrorServidor('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (enviandoRef.current) return

    const emailLimpio = valores.email.trim()
    const valoresNormalizados = { email: emailLimpio, password: valores.password }
    const nuevosErrores = validar(valoresNormalizados)
    setErrores(nuevosErrores)

    const primerCampoConError = Object.keys(nuevosErrores)[0]
    if (primerCampoConError) {
      formularioRef.current.elements[primerCampoConError].focus()
      return
    }

    enviandoRef.current = true
    setEnviando(true)
    try {
      await onIngresar(valoresNormalizados)
    } catch (error) {
      setErrorServidor(error.message || 'Ocurrió un error al iniciar sesión.')
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  return (
    <form className="login-container" ref={formularioRef} onSubmit={handleSubmit} noValidate>
      {errorServidor && (
        <div className="alert alert-danger py-2" role="alert">
          {errorServidor}
        </div>
      )}

      <div className="mb-3">
          <label htmlFor="email" className="title-email">
            Email
          </label>
          <div className="sec-input">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={MAX_EMAIL_LEN}
              aria-invalid={errores.email ? 'true' : undefined}
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={valores.email}
              onChange={handleChange}
              disabled={enviando}
            />
            {errores.email && <div className="invalid-feedback">{errores.email}</div>}
          </div>
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="title-pass">
          Contraseña
        </label>
        <div className="sec-input">
          <input
            id="password"
            name="password"
            type={mostrarPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            maxLength={MAX_PASSWORD_LEN}
            aria-invalid={errores.password ? 'true' : undefined}
            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
            value={valores.password}
            onChange={handleChange}
            disabled={enviando}
          />

          <button
            type="button"
            className="btn btn-outline-secondary mostrar"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            aria-pressed={mostrarPassword}
          >
            Ver contraseña
          </button>
          {errores.password && <div className="invalid-feedback">{errores.password}</div>}
        </div>
      </div>

      <Boton type="submit" className="button-login" disabled={enviando}>
        {enviando ? 'Verificando...' : 'Ingresar'}
      </Boton>
    </form>
  )
}

export default FormLogin