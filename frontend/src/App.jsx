import LayoutPublico from './shared/layout/LayoutPublico.jsx'
import './App.css'
import './styles/navbar.css'
import './styles/estilos.css'

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

export default App;