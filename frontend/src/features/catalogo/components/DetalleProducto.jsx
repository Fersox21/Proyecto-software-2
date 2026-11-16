import { useState } from 'react'
import { Link } from 'react-router'
import Boton from '../../../shared/components/Boton'
import { obtenerPreciosProducto, formatearPrecio } from '../../../shared/utils/formato'
import '../../../styles/catalogo.css'
function DetalleProducto({ producto, onAgregar }) {
  const nombreImagen = producto.nombre
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, '')

  const imagenUrl = `/images/${nombreImagen}.webp`

  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const sinStock = producto.stock === 0

  const { precioNormal, enPromocion, descuento, ahorro, precioVigente } = obtenerPreciosProducto(producto)

  function sumar() {
    setCantidad((c) => Math.min(c + 1, producto.stock))
  }

  function restar() {
    setCantidad((c) => Math.max(c - 1, 1))
  }

  function handleAgregar() {
    onAgregar(producto, cantidad)
    setAgregado(true)
    setCantidad(1)
  }

  return (
    <div className="detalle-producto-container">
      {/* catalago /el nombre del producto */}
      <nav className="mb-3">
        <ol className="breadcrumb align-items-center">
          <li className="breadcrumb-item">
            <Link to="/catalogo" className="link-secondary text-decoration-none">
              Catálogo
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      {/* contenedor */}
      <div className="container py-4 px-3 px-md-4">
      
        {/* lo divido en 2 columnas*/}
      <div className="row g-4 align-items-center tarjeta-detalle-wrapper ">
        
        {/* columna de la imagen */}
        <div className="col-md-5 text-center">
          <div className="imagen-detalle-contenedor">
            <img 
              src={imagenUrl} 
              alt={producto.nombre} 
              className="img-fluid imagen-detalle-fit" 
            />
          </div>
        </div>

        {/* columna con los detalles */}
        <div className="col-md-7">
          <div className="info-producto-panel">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <span className="categoria-chip-detalle">{producto.categoria}</span>
              {enPromocion && (
                <span
                  className="oferta-chip-detalle"
                  title={`${descuento}% de descuento (ahorrás ${formatearPrecio(ahorro)})`}
                >
                  -{descuento}%<span className="visually-hidden"> de descuento</span>
                </span>
              )}
            </div>
            <h1 className="titulo-producto-detalle mb-2">{producto.nombre}</h1>

            <div className="d-flex align-items-baseline gap-2 flex-wrap mb-3">
              {enPromocion && (
                <del className="precio-tag-detalle-anterior">
                  <span className="visually-hidden">Precio anterior: </span>
                  {formatearPrecio(precioNormal)}
                </del>
              )}
              <p className={`precio-tag-detalle mb-0 ${enPromocion ? 'precio-tag-detalle-promo' : ''}`}>
                {formatearPrecio(precioVigente)}
              </p>
            </div>
            
            {producto.peso && (
              <p className="descripcion-producto text-secondary mb-4">{producto.peso}</p>
            )}

            <hr className="perforacion my-4" />

            {/* controles de Cantidad */}
            <div className="mb-4" role="group" aria-labelledby="cantidad-label">
              <span id="cantidad-label" className="rotulo-filtro d-block mb-2">Cantidad</span>
              <div className="selector-cantidad d-inline-flex align-items-center">
                <button 
                  type="button" 
                  className="btn-cantidad" 
                  onClick={restar} 
                  disabled={sinStock || cantidad === 1}
                  aria-label="Restar una unidad"
                >
                  −
                </button>
                <span className="valor-cantidad" aria-live="polite" aria-atomic="true">
                  {cantidad}
                </span>
                <button 
                  type="button" 
                  className="btn-cantidad" 
                  onClick={sumar} 
                  disabled={sinStock || cantidad === producto.stock}
                  aria-label={`Sumar una unidad de ${producto.nombre}`}
                >
                  +
                </button>
              </div>
            </div>

            {/* boton de Agregar */}
            <Boton 
              variante="dark" 
              tamanio="lg" 
              className="w-100 btn-agregar-carrito" 
              disabled={sinStock} 
              onClick={handleAgregar}
            >
              {sinStock ? 'Sin stock' : 'Agregar al carrito'}
            </Boton>

            {!sinStock && (
              <p className="stock-info text-muted mt-2 mb-0">
                Quedan <strong>{producto.stock}</strong> unidades disponibles.
              </p>
            )}

            {/* alerta de producto agregado */}
            {agregado && (
              <div
                className="alerta-exito mt-3 d-flex justify-content-between align-items-center"
                role="status"
                aria-live="polite"
              >
                <span>¡Producto agregado al carrito!</span>
                <Link to="/carrito" className="btn-ir-carrito">
                  Ver carrito →
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
      </div>  
    </div>
  )
}

export default DetalleProducto