import { formatearPrecio, obtenerPreciosProducto } from '../../../shared/utils/formato'
import { BsTrash } from 'react-icons/bs'
import '../../../styles/carrito.css'

function ItemCarrito({ item, onCambiarCantidad, onQuitar }) {
  const nombreImagen = item.nombre
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')

  const imagenUrl = `/images/${nombreImagen}.webp`

  const { precioNormal, enPromocion, descuento, precioVigente } = obtenerPreciosProducto(item)

  return (
    <li className="list-group-item py-4 border-0 border-dark border-top bg-transparent rounded-0">
      <div className="row align-items-center g-3">
        <div className="col-12 col-md-5 d-flex align-items-center gap-3">
          <img
            src={imagenUrl}
            alt={item.nombre}
            className="rounded-4 object-fit-cover flex-shrink-0"
            style={{ width: '100px', height: '100px' }}
          />
          <div className="text-start d-flex flex-column justify-content-center">
            {item.categoria && (
              <span
                className="text-uppercase text-body-secondary fw-semibold mb-1"
                style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}
              >
                {item.categoria}
              </span>
            )}
            <h6 className="mb-1 fs-5 text-dark lh-sm fuente-titulos">
              {item.nombre}
            </h6>
            {enPromocion && (
              <span className="badge carrito-etiqueta-promo align-self-start mb-1">
                -{descuento}%
                <span className="visually-hidden"> de descuento</span>
              </span>
            )}
            {item.peso && (
              <p className="mb-1 text-body-secondary small">
                {item.peso}
              </p>
            )}
          </div>
        </div>

        <div className="col-6 col-md-2 text-md-center">
          <small className="text-body-secondary d-block mb-1">Precio unitario</small>
          {enPromocion && (
            <del className="carrito-precio-anterior d-block">
              <span className="visually-hidden">Precio anterior: </span>
              {formatearPrecio(precioNormal)}
            </del>
          )}
          <span className={`fs-6 fuente-titulos ${enPromocion ? 'carrito-precio-promo' : 'text-dark'}`}>
            {formatearPrecio(precioVigente)}
          </span>
        </div>

        <div className="col-6 col-md-2 text-md-center">
          <small className="text-body-secondary d-block mb-1">Cantidad</small>
          <div className="input-group input-group-sm rounded-pill border border-secondary-subtle py-0 d-inline-flex align-items-center justify-content-between" style={{ maxWidth: '110px' }}>
            <button
              className="btn btn-sm text-dark p-0 text-decoration-none border-0 rounded-circle btn-cantidad"
              type="button"
              onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
              aria-label={`Restar una unidad de ${item.nombre}`}
            >
              −
            </button>
            <span className="px-2 fuente-titulos">{item.cantidad}</span>
            <button
              className="btn btn-sm text-dark p-0 text-decoration-none border-0 rounded-circle btn-cantidad"
              type="button"
              disabled={item.cantidad >= item.stock}
              onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
              aria-label={`Sumar una unidad de ${item.nombre}`}
            >
              +
            </button>
          </div>
        </div>

        <div className="col-10 col-md-2 text-end text-md-center">
          <small className="text-body-secondary d-block mb-1">Total</small>
          <span className="text-dark carrito-total fuente-titulos">
            {formatearPrecio(precioVigente * item.cantidad)}
          </span>
        </div>

        <div className="col-2 col-md-1 text-end">
          <button
            type="button"
            className="btn p-2 border-0 rounded-circle btn-eliminar"
            onClick={() => onQuitar(item.id)}
            aria-label={`Eliminar ${item.nombre}`}
            title="Eliminar producto"
          >
            <BsTrash size={18} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default ItemCarrito
