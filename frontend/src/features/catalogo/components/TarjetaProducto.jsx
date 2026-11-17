import { Link } from 'react-router'
import {
  obtenerPreciosProducto,
  formatearPrecio,
  obtenerUrlImagenProducto,
  manejarErrorImagenProducto,
} from '../../../shared/utils/formato'
import { useState, useRef, useEffect } from 'react'
import '../../../styles/tarjetaProducto.css'

function TarjetaProducto({ producto, onAgregar }) {
  const imagenUrl = obtenerUrlImagenProducto(producto?.imagen)

  const sinStock = producto?.stock === 0

  // precioPromo llega como string desde PostgreSQL (DECIMAL); el helper lo normaliza.
  const { precioNormal, enPromocion, descuento, ahorro, precioVigente } = obtenerPreciosProducto(producto)

  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  const temporizador = useRef(null)

  useEffect(() => {
    return () => clearTimeout(temporizador.current)
  }, [])

  const manejarAgregar = () => {
    onAgregar(producto)
    setMostrarNotificacion(true)

    if (temporizador.current) {
      clearTimeout(temporizador.current)
    }

    temporizador.current = setTimeout(() => {
      setMostrarNotificacion(false)
    }, 2500)
  }

  return (
    <>
      <article className="card h-100 shadow-sm tarjeta-borde">
        <div className="position-relative p-3 pb-0 text-center tarjeta-imagen-contenedor">
          <span className="badge position-absolute top-0 start-0 m-3 z-1 text-uppercase tarjeta-categoria">
            {producto?.categoria}
          </span>

          {enPromocion && (
            <span
              className="badge position-absolute top-0 end-0 m-3 z-1 tarjeta-etiqueta-promo"
              title={`${descuento}% de descuento (ahorrás ${formatearPrecio(ahorro)})`}
            >
              -{descuento}%
              <span className="visually-hidden"> de descuento</span>
            </span>
          )}

          <Link to={`/catalogo/${producto?.id}`}>
            <img 
              src={imagenUrl}
              onError={manejarErrorImagenProducto}
              className="tarjeta-imagen" 
              alt={producto?.nombre || 'Producto'} 
            />
          </Link>
        </div>

        <div className="card-body d-flex flex-column">
          <h3 className="h6 card-title">
            <Link to={`/catalogo/${producto?.id}`} className="text-decoration-none tarjeta-nombre">
              {producto?.nombre}
            </Link>
          </h3>
          {producto?.descripcion && (
            <p className="tarjeta-descripcion">{producto.descripcion}</p>
          )}
          
          <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
            {enPromocion ? (
              <div className="tarjeta-precios">
                <del className="tarjeta-precio-anterior">
                  <span className="visually-hidden">Precio anterior: </span>
                  {formatearPrecio(precioNormal)}
                </del>
                <p className="tarjeta-precio tarjeta-precio-promo mb-0">
                  {formatearPrecio(precioVigente)}
                </p>
              </div>
            ) : (
              <p className="tarjeta-precio mb-0">{formatearPrecio(precioVigente)}</p>
            )}

            <div>
              {sinStock ? (
                <span className="badge text-bg-secondary py-2 px-3">Sin stock</span>
              ) : (
                onAgregar && (
                  <button
                    type="button"
                    className="btn tarjeta-agregar-a-carrito"
                    onClick={manejarAgregar}
                    aria-label={`Agregar ${producto?.nombre} al carrito`}
                  >
                    +
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </article>

      <div
        className={`toast-carrito ${mostrarNotificacion ? 'toast-carrito--visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-hidden={!mostrarNotificacion}
      >
        <span className="toast-carrito-icono" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <p className="toast-carrito-texto">
          Agregaste <span className="toast-carrito-nombre">{producto?.nombre}</span> al carrito
        </p>
      </div>
    </>
  )
}

export default TarjetaProducto