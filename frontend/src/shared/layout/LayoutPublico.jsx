import { Outlet, ScrollRestoration } from 'react-router';
import { MdClose, MdErrorOutline } from 'react-icons/md';
import { useCarrito } from '../../features/carrito';
import Navbar from './NavBar';
import Footer from './Footer';
import '../../styles/panelAdmin/adminLogin.css'
import '../../styles/carrito.css'


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

      <div
        className={`toast-carrito-alerta ${carrito.avisoProductosRemovidos ? 'toast-carrito-alerta--visible' : ''}`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        aria-hidden={!carrito.avisoProductosRemovidos}
      >
        <span className="toast-carrito-alerta-icono" aria-hidden="true">
          <MdErrorOutline size={18} />
        </span>
        <p className="toast-carrito-alerta-texto">
          Algunos productos fueron removidos de tu carrito porque ya no están disponibles o su stock se agotó.
        </p>
        <button
          type="button"
          className="toast-carrito-alerta-cerrar"
          onClick={carrito.cerrarAvisoRemovidos}
          aria-label="Cerrar notificación"
        >
          <MdClose size={16} />
        </button>
      </div>
      
      <Footer/>
      <ScrollRestoration />
    </>
  );
}

export default LayoutPublico;