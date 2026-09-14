import LayoutPublico from './shared/layout/LayoutPublico.jsx'
import './App.css'
import './styles/navbar.css'
import './styles/estilos.css'
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

function App() {
  return <RouterProvider router={router}/>
}

function menu(){
return(
  <nav>
    <Link to="/">Inicio</Link>
    <Link to="/productos">Productos</Link>
    <Link to="/contacto">Contacto</Link>
  </nav>
)
}

export default App;