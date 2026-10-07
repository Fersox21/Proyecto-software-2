import { Outlet, ScrollRestoration } from 'react-router'; 
import { useCarrito } from '../../features/carrito';
import Navbar from './NavBar';
import Footer from './Footer';

const ENLACES  = [
  { id: 1, texto: 'Inicio', destino: '/' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/preguntasFrecuentes' }
];

function LayoutPublico() {
  const carrito = useCarrito()

  return (
    <>
      <Navbar enlaces={ENLACES} cantidadCarrito={carrito.cantidadTotal} />
      
      <main className="main-content">
          <Outlet context={carrito} />
      </main>
      
      <Footer />
      <ScrollRestoration />
    </>
  );
}

export default LayoutPublico;