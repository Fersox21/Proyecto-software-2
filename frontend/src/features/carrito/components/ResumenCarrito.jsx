import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'
import ItemTarjeta from '../../../shared/components/ItemTarjeta'
import iconoEntregaLocal from '../../../assets/Items/iconoEntregaLocal.svg'
import iconoEntregaDomicilio from '../../../assets/Items/iconoEntregaDomicilio.svg'

const ENVIO_GRATIS_DESDE = 60000
const COSTO_ENVIO = 1800

function ResumenCarrito({ cantidadTotal, subtotal, onFinalizar, onVaciar }) {
  const envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const total = subtotal + envio
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal

  return (
    <div className="card shadow-sm rounded-4 m-4 p-3">
      <h2 className="h5 mb-4 text-start">Resumen de compra</h2>
      <div className="card-entrega">
        <ItemTarjeta
          titulo="Retiro en distribuidora"
          icono={iconoEntregaLocal}
          texto="Av. Juan Gilberto Funes 460, D5702 San Luis"
          descripcion="Listo en 2 horas"
          />
        <ItemTarjeta
          titulo="Envío estándar"
          icono={iconoEntregaDomicilio}
          texto="Entrega a domicilio"
          descripcion="Se entregará en 1-2 días hábiles"
          />
      </div>
      <div className="card-body">
        <dl className="row mb-0 text-start">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal} productos)</dt>
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
