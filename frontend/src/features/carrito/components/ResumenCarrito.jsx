import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'

const ENVIO_GRATIS_DESDE = 60000
const COSTO_ENVIO = 1800

function ResumenCarrito({ cantidadTotal, subtotal, onFinalizar, onVaciar }) {
  const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const total = subtotal + envio
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h5 mb-3">Resumen</h2>

        <dl className="row mb-0">
          <dt className="col-7 fw-normal">Productos ({cantidadTotal})</dt>
          <dd className="col-5 text-end">{formatearPrecio(subtotal)}</dd>
          <dt className="col-7 fw-normal">Envío</dt>
          <dd className="col-5 text-end">{envio === 0 ? 'Gratis' : formatearPrecio(envio)}</dd>
          <dt className="col-7 border-top pt-2">Total</dt>
          <dd className="col-5 text-end border-top pt-2 fw-bold">{formatearPrecio(total)}</dd>
        </dl>

        {faltaParaEnvioGratis > 0 && (
          <p className="small text-body-secondary">
            Te faltan {formatearPrecio(faltaParaEnvioGratis)} para el envío gratis.
          </p>
        )}

        <div className="d-grid gap-2 mt-3">
          <Boton variante="dark" onClick={onFinalizar}>
            Finalizar compra
          </Boton>
          <Boton variante="outline-secondary" onClick={onVaciar}>
            Vaciar carrito
          </Boton>
        </div>
      </div>
    </div>
  )
}

export default ResumenCarrito
