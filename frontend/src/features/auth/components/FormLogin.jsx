import { esRequerido } from "../../../shared/utils/validaciones"
import Boton from '../../../shared/components/Boton'
import { useRef, useState } from 'react'


function validar(valor) {
  const errores = {}
  if (!esRequerido(valor.password)) errores.password = 'Ingresá tu contraseña.'
  return errores
}


function FormLogin({ onIngresar }) {

  const [valores, setValores] = useState({ password: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const formularioRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setValores({ ...valores, [name]: value })
    if (errores[name]) setErrores({ ...errores, [name]: undefined })
    setErrorServidor('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const nuevosErrores = validar(valores)
    setErrores(nuevosErrores)

    const primerCampoConError = Object.keys(nuevosErrores)[0]
    if (primerCampoConError) {
      formularioRef.current.elements[primerCampoConError].focus()
      return
    }

    setEnviando(true)
    try {
      await onIngresar(valores)
    } catch (error) {
      setErrorServidor(error.message)
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
              type="text"
              name="email"
              autoComplete="current-email"
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={valores.email}
              onChange={handleChange}
              disabled={enviando}

              />
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