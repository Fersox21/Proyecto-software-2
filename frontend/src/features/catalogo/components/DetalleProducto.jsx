import { useState } from 'react'
import { Link } from 'react-router'
import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'

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

  let textoBoton = 'Agregar al carrito'
  if (sinStock) textoBoton = 'Sin stock'

  return (
    <div className="row g-4 g-lg-5">
      <div className="col-md-6">
        <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded-3 imagen-detalle w-100" />
      </div>

      <div className="col-md-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/catalogo" className="link-dark">
                Catálogo
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {producto.nombre}
            </li>
          </ol>
        </nav>

        <span className="badge text-bg-light text-uppercase mb-2">{producto.categoria}</span>
        <h1 className="h2">{producto.nombre}</h1>
        <p className="fs-3 fw-bold">{formatearPrecio(producto.precio)}</p>
        <p className="text-body-secondary">{producto.descripcion}</p>

        <h2 className="h6">Cantidad</h2>
        <div className="input-group w-auto mb-4">
          <button className="btn btn-outline-secondary" type="button" onClick={restar} disabled={sinStock || cantidad === 1} aria-label="Restar">
            −
          </button>
          <span className="input-group-text bg-white px-4">{cantidad}</span>
          <button className="btn btn-outline-secondary" type="button" onClick={sumar} disabled={sinStock || cantidad === producto.stock} aria-label="Sumar">
            +
          </button>
        </div>

        <Boton variante="dark" tamanio="lg" className="w-100" disabled={sinStock} onClick={handleAgregar}>
          {textoBoton}
        </Boton>

        {!sinStock && <p className="small text-body-secondary mt-2">Quedan {producto.stock} unidades.</p>}

        {agregado && (
          <div className="alert alert-success mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2" role="status">
            <span>¡Listo! Agregaste el producto al carrito.</span>
            <Link to="/carrito" className="btn btn-sm btn-success">
              Ir al carrito
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetalleProducto
