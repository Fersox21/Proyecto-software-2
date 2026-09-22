import { RouterProvider } from 'react-router/dom';
import { router } from './router';
import './styles/estilos.css'
import './styles/card-producto.css'

function App() {
  return <RouterProvider router={router} />
}


export default App;