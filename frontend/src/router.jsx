import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import  HomePage  from './features/home/pages/HomePage';
import  CatalogoPage  from './features/catalogo/pages/CatalogoPage';
import  FormularioPage  from './features/formulario/pages/FormularioPage';
import  PreguntasFrecuentesPage  from './features/preguntasFrecuentes/pages/PreguntasFrecuentesPage';



export const router = createBrowserRouter([
  { 
    path: '/',
    element: <LayoutPublico  />, 
    errorElement: <NoEncontradaPage />, 
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'preguntasFrecuentes', element: <PreguntasFrecuentesPage />},
      { path: 'realizarPedido', element: <FormularioPage /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
]);