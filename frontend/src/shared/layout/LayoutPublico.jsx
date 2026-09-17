import { useState } from 'react';
import { Outlet } from 'react-router'; 
import Navbar from './NavBar';
import Footer from './Footer';

function LayoutPublico({ enlaces }) {
  const [carrito, setCarrito] = useState([]);

  function manejarAgregarAlCarrito(productoSeleccionado) {
    console.log("Agregado al carrito:", productoSeleccionado.nombre);
    setCarrito([...carrito, productoSeleccionado]);
  }

  return (
    <>
      <Navbar enlaces={enlaces} cantidadCarrito={carrito.length} />
      
      <main>
          <Outlet context={{ carrito, manejarAgregarAlCarrito }} />
      </main>
      
      <Footer />
    </>
  );
}

export default LayoutPublico;