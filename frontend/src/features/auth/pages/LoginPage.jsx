import { iniciarSesion } from '../services/authService'
import { useNavigate } from 'react-router'
import FormLogin from '../components/FormLogin'


function LoginPage(){
  const navigate = useNavigate()

  async function handleIngresar({ email, password }) {
  try {
    await iniciarSesion({ email, password })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Intente nuevamente.', {
        cause: error // Conserva el error original para trazas de depuración
      })
    }
    // Errores de API (ej: 401 Unauthorized, 400 Bad Request) se re-lanzan directo
    throw error
  }

  // Redirección al completar con éxito
  navigate('/administrador', { replace: true })
}

    return(<>

    <div className="container-login justify-content-center align-items-center pb-5 pt-5">
      <div className="row justify-content-center align-items-center g-2">
        <div className="col-sm-10 col-md-7 col-lg-5">
          <section className='login-form'>
            <h1 className="h3 text-center titulo-tag">Ingreso Administrativo</h1>
            <FormLogin onIngresar={handleIngresar} />
          </section>
          
        </div>
        
      </div>
      
    </div>
    

    </>
    )
}
export default LoginPage
