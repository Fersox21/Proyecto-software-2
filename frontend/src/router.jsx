import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import Home from './features/home/pages/HomePage';
import Catalogo from './features/catalogo/pages/CatalogoPage';
import Formulario from './features/formulario/pages/FormularioPage';
import { PreguntasFrecuentesPage } from './features/preguntasFrecuentes';
import Carrito from './features/Carrito';

const enlaces = [
  { id: 1, texto: 'Inicio', destino: '/' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/preguntasFrecuentesPage' },
  { id: 4, texto: 'Realizar pedido', destino: '/realizarPedido' }
];

export const router = createBrowserRouter([
  { 
    path: '/',
    element: <LayoutPublico enlaces={enlaces} />, 
    errorElement: <NoEncontradaPage />, 
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalogo /> },
      { path: 'preguntasFrecuentesPage', element: <PreguntasFrecuentesPage />},
      { path: 'realizarPedido', element: <Formulario /> },
      { path: 'carrito', element: <Carrito />},
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }
]);