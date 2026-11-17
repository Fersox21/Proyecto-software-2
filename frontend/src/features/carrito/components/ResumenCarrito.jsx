import Boton from '../../../shared/components/Boton'
import { formatearPrecio, redondear2 } from '../../../shared/utils/formato'
import { Link } from 'react-router'

function ResumenCarrito({ cantidadTotal, subtotal, subtotalOriginal, descuentosAplicados = 0, onVaciar }) {
  const subtotalBase = subtotalOriginal ?? subtotal
  const descuentos = redondear2(descuentosAplicados) || 0
  const total = redondear2(Math.max(0, subtotalBase - descuentos))

  return (
    <div className="card shadow-sm rounded-4 ms-4 p-3" style={{maxWidth: '100%'}}>
      <h4 className="mb-4 text-start">Resumen de compra</h4>

      <hr className="my-3 text-secondary opacity-25" />

      <div className="card-body">
        <dl className="row mb-0 text-start">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal} productos)</dt>
          <dd className="col-5 text-end fuente-titulos">{formatearPrecio(subtotalBase)}</dd>

          <dt className="col-7 fw-normal">Descuentos aplicados</dt>
          <dd className={`col-5 text-end fuente-titulos ${descuentos > 0 ? 'carrito-precio-promo' : 'text-body-secondary'}`}>
            {descuentos > 0 ? `- ${formatearPrecio(descuentos)}` : formatearPrecio(0)}
          </dd>

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
