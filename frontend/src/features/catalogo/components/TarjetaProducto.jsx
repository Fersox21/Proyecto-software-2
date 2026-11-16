import { Link } from 'react-router'
import { obtenerPreciosProducto, formatearPrecio } from '../../../shared/utils/formato'
import { useState, useRef } from 'react'
import '../../../styles/tarjetaProducto.css'

function TarjetaProducto({ producto, onAgregar }) {
  const nombreImagen = producto?.nombre
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')

  const imagenUrl = `/images/${nombreImagen}.webp`
  const imagendefault = '/images/harina.webp'

  const sinStock = producto?.stock === 0

  // precioPromo llega como string desde PostgreSQL (DECIMAL); el helper lo normaliza.
  const { precioNormal, enPromocion, descuento, precioVigente } = obtenerPreciosProducto(producto)

  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  const temporizador = useRef(null)

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

  const manejarErrorImagen = (e) => {
    e.target.onerror = null // Previene bucle infinito si harina.webp tampoco existiera
    e.target.src = imagendefault
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
              title={`${descuento}% de descuento`}
            >
              -{descuento}%
              <span className="visually-hidden"> de descuento</span>
            </span>
          )}

          <Link to={`/catalogo/${producto?.id}`}>
            <img 
              src={imagenUrl}
              onError={manejarErrorImagen}
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
          <p className="tarjeta-peso">{producto?.peso}</p>
          
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

      {mostrarNotificacion && (
        <div 
          className="toast show align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-auto shadow-lg" 
          style={{ zIndex: 1050 }}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body fs-6">
              Agregaste <strong>{producto?.nombre}</strong> al carrito
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TarjetaProducto