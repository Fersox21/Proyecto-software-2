import Navbar from './NavBar';
import Footer from './Footer';
import { Outlet } from 'react-router';

const enlaces = [
  { id: 1, texto: 'Inicio', destino: '/' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/preguntasFrecuentes' },
  { id: 4, texto: 'Realizar pedido', destino: '/realizarPedido' },
];

function LayoutPublico() {
return (
<>

    <Navbar enlaces={enlaces} />
    <main><Outlet /></main>
    <Footer />

</>
);
}

export default LayoutPublico;