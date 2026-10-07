import { iniciarSesion } from '../services/authService'
import { useNavigate } from 'react-router'
import FormLogin from '../components/FormLogin'


function LoginPage(){
  const navigate = useNavigate()

  async function handleIngresar( { password }) {
    await iniciarSesion({ password }) 
    navigate('/administrador', { replace: true })
  }

    return(<>

    <div class="container-login justify-content-center align-items-center pb-5 pt-5">
      <div class="row justify-content-center align-items-center g-2">
        <div class="col-sm-10 col-md-7 col-lg-5">
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
