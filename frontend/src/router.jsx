import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import  Home  from './features/home';
import  Catalogo  from './features/catalogo/Catalogo';
import  Formulario  from './features/formulario/Formulario';
import  PreguntasFrecuentesPage  from './features/preguntasFrecuentes/pages/PreguntasFrecuentesPage';



export const router = createBrowserRouter([
  { 
    path: '/',
    element: <LayoutPublico  />, 
    errorElement: <NoEncontradaPage />, 
    children: [
      { index: true, element: <Home /> },
      { path: 'catalogo', element: <Catalogo /> },
      { path: 'preguntasFrecuentes', element: <PreguntasFrecuentesPage />},
      { path: 'realizarPedido', element: <Formulario /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
]);