import { RouterProvider } from 'react-router';
import { router } from './router.jsx';
import './styles/estilos.css'
import './styles/card-producto.css'

function App() {
  return <RouterProvider router={router} />
}


export default App;