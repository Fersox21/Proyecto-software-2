import { useRef, useState } from 'react'


function LoginPage(){
const [valores, setValores] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)



    return(<>

        <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <div className="input-group has-validation">
          <input
            id="password"
            name="password"
            type={mostrarPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
            value={valores.password}
            disabled={enviando}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            aria-pressed={mostrarPassword}
          >
            {mostrarPassword ? 'Ocultar' : 'Mostrar'}
          </button>
          {errores.password && <div className="invalid-feedback">{errores.password}</div>}
        </div>
      </div>


            <button type="submit" variante="dark" className="w-100" disabled={enviando}>
                {enviando ? 'Verificando...' : 'Ingresar'}
            </button>

    </>
    )
}
export default LoginPage
