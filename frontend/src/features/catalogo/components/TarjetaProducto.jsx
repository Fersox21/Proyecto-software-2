import { Link } from 'react-router'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useState, useRef } from 'react'

function TarjetaProducto({ producto, onAgregar }) {
  const nombreImagen = producto.nombre
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')

  const imagenUrl = `/images/${nombreImagen}.webp`

  const sinStock = producto.stock === 0
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  // Ref permite controlar el temporizador sin que se pisen entre clics
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

  return (
    <>
      <article className="card h-100 shadow-sm">
        <div className="position-relative p-3 pb-0 text-center">
          
          <span className="badge text-bg-dark position-absolute top-0 end-0 m-3 z-1 text-uppercase">
            {producto.categoria}
          </span>
          
          <Link to={`/catalogo/${producto.id}`}>
            <img 
              src={imagenUrl}
              className="card-img-top" 
              alt={producto.nombre} 
              style={{ height: '200px', objectFit: 'contain' }}
            />
          </Link>
        </div>

        <div className="card-body d-flex flex-column">
          <h3 className="h6 card-title">
            <Link to={`/catalogo/${producto.id}`} className="link-dark text-decoration-none">
              {producto.nombre}
            </Link>
          </h3>
          
          <p className="fs-5 mb-3 precio-fraunces">{formatearPrecio(producto.precioVenta)}</p>

          <div className="mt-auto">
            {sinStock ? (
              <span className="badge text-bg-secondary w-100 py-2">Sin stock</span>
            ) : (
              onAgregar && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark w-100"
                  onClick={manejarAgregar}
                  aria-label={`Agregar ${producto.nombre} al carrito`}
                >
                  Agregar al carrito
                </button>
              )
            )}
          </div>
        </div>
      </article>

      {/* Notificación flotante al agregar producto */}
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
                Agregaste <strong>{producto.nombre}</strong> al carrito
              </div>
            </div>
          </div>
        )}
    </>
  )
}

export default TarjetaProducto