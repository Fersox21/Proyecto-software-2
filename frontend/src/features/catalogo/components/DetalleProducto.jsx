import { useState } from 'react'
import { Link } from 'react-router'
import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'
import '../../../styles/catalogo.css'
function DetalleProducto({ producto, onAgregar }) {
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  const sinStock = producto.stock === 0

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
              src={producto.imagen} 
              alt={producto.nombre} 
              className="img-fluid imagen-detalle-fit" 
            />
          </div>
        </div>

        {/* columna con los detalles */}
        <div className="col-md-7">
          <div className="info-producto-panel">
            <span className="categoria-chip-detalle mb-2">{producto.categoria}</span>
            <h1 className="titulo-producto-detalle mb-2">{producto.nombre}</h1>
            
            <p className="precio-tag-detalle mb-3">{formatearPrecio(producto.precio)}</p>
            
            {producto.descripcion && (
              <p className="descripcion-producto text-secondary mb-4">{producto.descripcion}</p>
            )}

            <hr className="perforacion my-4" />

            {/* controles de Cantidad */}
            <div className="mb-4">
              <label className="rotulo-filtro d-block mb-2">Cantidad</label>
              <div className="selector-cantidad d-inline-flex align-items-center">
                <button 
                  type="button" 
                  className="btn-cantidad" 
                  onClick={restar} 
                  disabled={sinStock || cantidad === 1}
                >
                  −
                </button>
                <span className="valor-cantidad">{cantidad}</span>
                <button 
                  type="button" 
                  className="btn-cantidad" 
                  onClick={sumar} 
                  disabled={sinStock || cantidad === producto.stock}
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
              <div className="alerta-exito mt-3 d-flex justify-content-between align-items-center">
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