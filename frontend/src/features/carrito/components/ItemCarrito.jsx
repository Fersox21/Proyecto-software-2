import { formatearPrecio } from '../../../shared/utils/formato'

function ItemCarrito({ item, onCambiarCantidad, onQuitar }) {
  return (
    <li className="list-group-item py-3">
      <div className="d-flex flex-wrap flex-sm-nowrap gap-3 align-items-center">
        <img src={item.imagen} alt={item.nombre} className="imagen-carrito rounded" />

        <div className="flex-grow-1">
          <h3 className="h6 mb-1">{item.nombre}</h3>
          <p className="small text-body-secondary mb-2">
            {formatearPrecio(item.precio)} c/u
          </p>
          <div className="input-group input-group-sm w-auto">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
              aria-label={`Restar una unidad de ${item.nombre}`}
            >
              −
            </button>
            <span className="input-group-text bg-white px-3">{item.cantidad}</span>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={item.cantidad >= item.stock}
              onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
              aria-label={`Sumar una unidad de ${item.nombre}`}
            >
              +
            </button>
          </div>
        </div>

        <div className="text-sm-end ms-auto">
          <p className="fw-bold mb-1">{formatearPrecio(item.precio * item.cantidad)}</p>
          <button type="button" className="btn btn-sm btn-link link-danger p-0" onClick={() => onQuitar(item.id, item.talle)}>
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}

export default ItemCarrito
