import { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router';
import { MdArrowBack } from 'react-icons/md';
import ItemCarrito from '../components/ItemCarrito'
import ResumenCarrito from '../components/ResumenCarrito'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import '../../../styles/carrito.css'

function CarritoPage() {
  const {
    items,
    cantidadTotal,
    subtotal,
    subtotalOriginal,
    descuentosAplicados,
    verificarDisponibilidad,
    cambiarCantidad,
    quitarProducto,
    vaciarCarrito,
  } = useOutletContext();

  useEffect(() => {
    verificarDisponibilidad?.();
  }, [verificarDisponibilidad]);

  if (items.length === 0) {
    return (
      <MensajeVacio titulo="Tu carrito está vacío" texto="Agregá items desde el catálogo.">
        <Link to="/catalogo" className="btn btn-dark">
          Ir al catálogo
        </Link>
      </MensajeVacio>
    )
  }

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <h1 className="h1 mb-2 text-start">Tu carrito</h1>
          <div className="d-flex justify-content-between">
            <small className="ps-3">{items.length} productos · {cantidadTotal} unidades</small>
            <a href="/catalogo" className="text-decoration-none text-black">
              <MdArrowBack /> Seguir comprando
            </a>
          </div>
          <ul className="list-group mt-4">
            {items.map((prod) => (
              <ItemCarrito
                key={prod.id}
                item={prod}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitarProducto}
              />
            ))}
          </ul>
        </div>

        <div className="col-12 col-lg-5">
          <ResumenCarrito
            cantidadTotal={cantidadTotal}
            subtotal={subtotal}
            subtotalOriginal={subtotalOriginal}
            descuentosAplicados={descuentosAplicados}
            onVaciar={vaciarCarrito}
          />
        </div>
      </div>
    </div>
  );
}

export default CarritoPage
