import { createBrowserRouter } from 'react-router'
import LayoutPublico from './shared/layout/LayoutPublico'
import LayoutPrivado from './shared/layout/LayoutPrivado'
import NoEncontradaPage from './shared/pages/NoEncontradaPage'
import { HomePage } from './features/home'
import { CatalogoPage, DetalleProductoPage } from './features/catalogo'
import { FormularioPage } from './features/formulario'
import { PreguntasFrecuentesPage } from './features/preguntasFrecuentes'
import { CarritoPage } from './features/carrito'
import { AdministradorPage} from './features/administrador' 
import { LoginPage, protegerRuta, redirigirSiHaySesion } from './features/auth'

export const router = createBrowserRouter([
  {  
    path: '/',
    element: <LayoutPublico />, 
    errorElement: <NoEncontradaPage />, 
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'catalogo/:id', element: <DetalleProductoPage /> },
      { path: 'preguntasFrecuentes', element: <PreguntasFrecuentesPage />},
      { path: 'realizarPedido', element: <FormularioPage /> },
      { path: 'carrito', element: <CarritoPage />},
      { path: 'login', element: <LoginPage />, loader: redirigirSiHaySesion,},
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }, 

  {
    path: '/administrador',
    element: <LayoutPrivado />,
    loader: protegerRuta, 
    errorElement: <NoEncontradaPage />,
    children: [{ index: true, element: <AdministradorPage /> }],
  },
]);