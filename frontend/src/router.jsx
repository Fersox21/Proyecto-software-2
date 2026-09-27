import { createBrowserRouter } from 'react-router'
import LayoutPublico from './shared/layout/LayoutPublico'
import NoEncontradaPage from './shared/pages/NoEncontradaPage'
import { HomePage } from './features/home'
import { CatalogoPage, DetalleProductoPage } from './features/catalogo'
import { FormularioPage } from './features/formulario'
import { PreguntasFrecuentesPage } from './features/preguntasFrecuentes'
import { CarritoPage } from './features/carrito'

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
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }
]);