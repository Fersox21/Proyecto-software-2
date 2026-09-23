import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import Home from './features/home/pages/HomePage';
import Catalogo from './features/catalogo/pages/CatalogoPage';
import Formulario from './features/formulario/pages/FormularioPage';
import PreguntasFrecuentes from './features/preguntasFrecuentes/pages/PreguntasFrecuentesPage';

const enlaces = [
  { id: 1, texto: 'Inicio', destino: '/' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/preguntasFrecuentes' },
  { id: 4, texto: 'Realizar pedido', destino: '/realizarPedido' },
];

export const router = createBrowserRouter([
  { 
    path: '/',
    element: <LayoutPublico enlaces={enlaces} />, 
    errorElement: <NoEncontradaPage />, 
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalogo /> },
      { path: 'preguntasFrecuentes', element: <PreguntasFrecuentes />},
      { path: 'realizarPedido', element: <Formulario /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }
]);