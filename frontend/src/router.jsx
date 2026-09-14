import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/LayoutGestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';
import Spinner from './shared/components/Spinner';
import { HomePage } from './features/home';
import { CatalogoPage, DetalleProductoPage } from './features/catalogo';
import { CarritoPage } from './features/carrito';
import { ContactoPage } from './features/contacto';
import { LoginPage, protegerRuta, redirigirSiHaySesion } from './features/auth';
import { PanelInicioPage } from './features/panel';


export const router = createBrowserRouter([

{
path: '/',

element: <LayoutPublico />,
errorElement: <NoEncontradaPage />,
children: [
{ index: true, element: <HomePage /> }, // "/" exacto
{ path: 'catalogo', element: <CatalogoPage /> }, // "/catalogo"
{ path: 'catalogo/:id', element: <DetalleProductoPage /> }, // ":id" es un parámetro
{ path: 'carrito', element: <CarritoPage /> },
{ path: 'contacto', element: <ContactoPage /> },

{ path: 'login', element: <LoginPage />, loader: redirigirSiHaySesion, hydrateFallbackElement: <Spinner />,},
{ path: '*', element: <NoEncontradaPage /> }, // cualquier otra URL

],}])