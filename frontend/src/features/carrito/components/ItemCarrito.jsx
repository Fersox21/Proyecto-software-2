import { useState } from 'react'
import {
  formatearPrecio,
  obtenerPreciosProducto,
  redondear2,
  obtenerUrlImagenProducto,
  manejarErrorImagenProducto,
} from '../../../shared/utils/formato'
import { bloquearTeclasNoNumericas, sanitizarEnteroPositivo } from '../../../shared/utils/validaciones'
import { BsTrash } from 'react-icons/bs'
import '../../../styles/carrito.css'

function ItemCarrito({ item, onCambiarCantidad, onQuitar }) {
  const imagenUrl = obtenerUrlImagenProducto(item?.imagen)
  const [borradorCantidad, setBorradorCantidad] = useState(null)

  const cantidadTexto =
    borradorCantidad && borradorCantidad.base === item.cantidad
      ? borradorCantidad.valor
      : String(item.cantidad)

  function handleCantidadChange(e) {
    const valor = sanitizarEnteroPositivo(e.target.value)
    if (valor === '') {
      setBorradorCantidad({ base: item.cantidad, valor: '' })
      return
    }
    const maxStock = Number.isFinite(item.stock) ? item.stock : Infinity
    const numero = Math.min(Math.max(1, Number(valor)), maxStock)
    setBorradorCantidad(null)
    if (numero !== item.cantidad) {
      onCambiarCantidad(item.id, numero)
    }
  }

  function handleCantidadBlur() {
    if (cantidadTexto === '') {
      setBorradorCantidad(null)
      if (item.cantidad !== 1) {
        onCambiarCantidad(item.id, 1)
      }
    }
  }

  const { precioNormal, enPromocion, descuento, precioVigente } = obtenerPreciosProducto(item)

  return (
    <li className="list-group-item py-4 border-0 border-dark border-top bg-transparent rounded-0">
      <div className="row align-items-center g-3">
        <div className="col-12 col-md-5 d-flex align-items-center gap-3">
          <img
            src={imagenUrl}
            onError={manejarErrorImagenProducto}
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
            {item.descripcion && (
              <p className="mb-1 text-body-secondary small">
                {item.descripcion}
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
            <input
              type="number"
              min={1}
              max={Number.isFinite(item.stock) ? item.stock : undefined}
              step={1}
              value={cantidadTexto}
              onKeyDown={(e) => bloquearTeclasNoNumericas(e, false)}
              onChange={handleCantidadChange}
              onBlur={handleCantidadBlur}
              className="form-control form-control-sm border-0 bg-transparent text-center p-0 fuente-titulos carrito-input-cantidad"
              aria-label={`Cantidad de ${item.nombre}`}
            />
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
          {enPromocion && (
            <del className="carrito-precio-anterior d-block">
              <span className="visually-hidden">Total anterior: </span>
              {formatearPrecio(redondear2(precioNormal * item.cantidad))}
            </del>
          )}
          <span className={`carrito-total fuente-titulos ${enPromocion ? 'carrito-precio-promo' : 'text-dark'}`}>
            {formatearPrecio(redondear2(precioVigente * item.cantidad))}
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
