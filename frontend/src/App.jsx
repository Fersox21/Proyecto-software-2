import { RouterProvider } from 'react-router';
import { router } from './router.jsx';
import './styles/estilos.css'
<<<<<<< HEAD
import {createBrowserRouter} from 'react-router'
import { link } from 'react-router'
import {RouterProvider} from 'react-router/dom'
import {router} from './router'

const enlaces = [
{ id: 1, texto: 'Inicio', destino: '../../index.html' },
{ id: 2, texto: 'Catálogo', destino: 'catalogo.html' },
{ id: 3, texto: 'Preguntas frecuentes', destino: 'preguntas.html' },
{ id: 4, texto: 'Formulario', destino: '/Formulario' },
]

const router = createBrowserRouter([
  {path: '/', element: <Home />},
  {path: '/formulario', element: <Formulario />},
])
=======
import './styles/card-producto.css'
>>>>>>> b6963e3cd48f5d39aa159e85c32ef76dd51d3f8b

function App() {
  return <RouterProvider router={router} />
}

<<<<<<< HEAD
function menu(){
return(
  <nav>
    <Link to="/">Inicio</Link>
    <Link to="/productos">Productos</Link>
    <Link to="/contacto">Contacto</Link>
  </nav>
)
}
=======
>>>>>>> b6963e3cd48f5d39aa159e85c32ef76dd51d3f8b

export default App;