import { createBrowserRouter } from 'react-router'
import LayoutPublico from './shared/layout/LayoutPublico'
import LayoutPrivado from './shared/layout/LayoutPrivado'
import NoEncontradaPage from './shared/pages/NoEncontradaPage'
import { HomePage } from './features/home'
import { CatalogoPage, DetalleProductoPage } from './features/catalogo'
import { PreguntasFrecuentesPage } from './features/preguntasFrecuentes'
import { CarritoPage } from './features/carrito'
import { AdministradorPage, ConfiguracionPage, EstadisticasPage, LotesPage, PedidosPage, PromocionesPage, ProveedoresPage, VencimientosPage, VentasPage} from './features/administrador' 
import { PedidoPage } from './features/pedido'
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
      { path: 'carrito', element: <CarritoPage />},
      { path: 'finalizar-compra', element: <PedidoPage />},
      { path: 'login', element: <LoginPage />, loader: redirigirSiHaySesion,},
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }, 

  {
    path: '/administrador',
    element: <LayoutPrivado />,
    loader: protegerRuta, 
    errorElement: <NoEncontradaPage />,
    children: [
      { index: true, element: <AdministradorPage />, loader: protegerRuta },
      { path: 'estadisticas', element: <EstadisticasPage />, loader: protegerRuta },
      { path: 'ventas', element: <VentasPage />, loader: protegerRuta },
      { path: 'lotes', element: <LotesPage />, loader: protegerRuta },
      { path: 'provedores', element: <ProveedoresPage />, loader: protegerRuta },
      { path: 'vencimiento', element: <VencimientosPage />, loader: protegerRuta },
      { path: 'promociones', element: <PromocionesPage />, loader: protegerRuta },
      { path: 'pedidos', element: <PedidosPage />, loader: protegerRuta },
      { path: 'configuracion', element: <ConfiguracionPage />, loader: protegerRuta },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
]);