import { Link } from 'react-router'
import { formatearPrecio } from '../../../shared/utils/formato'

// CLASE 3 · Responder a eventos
// La tarjeta NO sabe qué es un carrito: solo avisa "quieren agregar este producto
// en este talle" llamando a onAgregar. Quién guarda el carrito lo decide el padre.
function TarjetaProducto({ producto, onAgregar }) {
  const sinStock = producto.stock === 0

  return (
    <article className="card h-100 shadow-sm tarjeta-producto">
      <span className="ojal" aria-hidden="true"></span>

      <div className="imagen-envoltorio">
        <Link to={`/catalogo/${producto.id}`}>
          <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
        </Link>
        <span className="badge categoria-chip text-uppercase">{producto.categoria}</span>
      </div>
      <div className="perforacion"></div>

      <div className="card-body d-flex flex-column">
        <h3 className="h6 card-title">
          <Link to={`/catalogo/${producto.id}`} className="link-dark text-decoration-none">
            {producto.nombre}
          </Link>
        </h3>
        <p className="precio-tag mb-3">{formatearPrecio(producto.precio)}</p>

        <div className="mt-auto">
          {sinStock ? (
            <span className="badge text-bg-secondary">Sin stock</span>
          ) : (
            onAgregar && (
              <button
                type="button"
                className="btn btn-sm btn-outline-dark w-100"
                onClick={() => onAgregar(producto)}
                aria-label={`Agregar ${producto.nombre} al carrito`}
              >
                Agregar al carrito
              </button>
            )
          )}
        </div>
      </div>
    </article>
  )
}

export default TarjetaProducto
