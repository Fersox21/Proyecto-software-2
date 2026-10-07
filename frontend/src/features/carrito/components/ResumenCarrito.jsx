import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'
import { Link } from 'react-router'

function ResumenCarrito({ cantidadTotal, subtotal, onVaciar }) {
  const total = subtotal

  return (
    <div className="card shadow-sm rounded-4 ms-4 p-3" style={{maxWidth: '100%'}}>
      <h4 className="mb-4 text-start">Resumen de compra</h4>

      <hr className="my-3 text-secondary opacity-25" />

      <div className="card-body">
        <dl className="row mb-0 text-start">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal} productos)</dt>
          <dd className="col-5 text-end fuente-titulos">{formatearPrecio(subtotal)}</dd>

          <hr className="my-3 text-secondary opacity-25" />

          <div className="d-flex align-items-center pt-2">
            <dt className="col-7">Total</dt>
            <dd className="col-5 text-end h2 fuente-titulos">{formatearPrecio(total)}</dd>
          </div>
        </dl>

        <div className="d-grid gap-2 mt-3">
          <Link to="/finalizar-compra" className="text-decoration-none">
            <Boton style={{width: '100%'}} variante="dark">
              Confirmar compra
            </Boton>
          </Link>
          <Boton variante="outline-secondary" onClick={onVaciar}>
            Vaciar carrito
          </Boton>
        </div>
      </div>
    </div>
  )
}

export default ResumenCarrito
