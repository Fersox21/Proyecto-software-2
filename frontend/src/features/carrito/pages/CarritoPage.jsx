import { useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { MdArrowBack } from 'react-icons/md';
import ItemCarrito from '../components/ItemCarrito'
import ResumenCarrito from '../components/ResumenCarrito'
import MensajeVacio from '../../../shared/components/MensajeVacio'

function CarritoPage() {
  const { items, cantidadTotal, subtotal, cambiarCantidad, quitarProducto, vaciarCarrito } = useOutletContext();
  const [compraConfirmada, setCompraConfirmada] = useState(false);

  function handleFinalizar() {
    vaciarCarrito();
    setCompraConfirmada(true);
  }

  if (compraConfirmada) {
    return (
      <MensajeVacio titulo="¡Gracias por tu compra!" texto="Te enviamos un email con el detalle del pedido.">
        <Link to="/catalogo" className="btn btn-dark">
          Seguir comprando
        </Link>
      </MensajeVacio>
    )
  }

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
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <h1 className="h2 mb-2 text-start">Tu carrito</h1>
          <div className="d-flex justify-content-between">
            <p>{items.length} productos · {cantidadTotal} unidades</p>
            <a href="/catalogo" className="text-decoration-none text-black"><MdArrowBack /> Seguir comprando</a>
          </div>
          <hr className="mb-3 text-secondary opacity-25" style={{width: '100%'}} />
          <ul className="list-group shadow-sm">
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
        <div className="col-12 col-lg-5" style={{maxWidth: '100%'}}>
          <ResumenCarrito
            cantidadTotal={cantidadTotal}
            subtotal={subtotal}
            onFinalizar={handleFinalizar}
            onVaciar={vaciarCarrito}
          />
        </div>
      </div>
    </div>
  )
}

export default CarritoPage
