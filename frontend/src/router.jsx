import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import { HomePage } from './features/home';
import { CatalogoPage } from './features/catalogo';
import { FormularioPage } from './features/formulario';
import { PreguntasFrecuentesPage } from './features/preguntasFrecuentes';

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
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'preguntasFrecuentes', element: <PreguntasFrecuentesPage />},
      { path: 'realizarPedido', element: <FormularioPage /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  }
]);