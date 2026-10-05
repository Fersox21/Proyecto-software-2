import { useState } from 'react'
import Boton from '../../../shared/components/Boton'
import { formatearPrecio } from '../../../shared/utils/formato'
import ItemTarjeta from '../../../shared/components/ItemTarjeta'
import iconoEntregaLocal from '../../../assets/Items/iconoEntregaLocal.svg'
import iconoEntregaDomicilio from '../../../assets/Items/iconoEntregaDomicilio.svg'
import EscogerUbicacion from './EscogerUbicacion'

const ENVIO_GRATIS_DESDE = 60000
const COSTO_ENVIO = 1800

function ResumenCarrito({ cantidadTotal, subtotal, onFinalizar, onVaciar }) {
  const [entrega, setEntrega] = useState('null')
  const esRetiro = entrega === 'retiro' || entrega === 'null'
  const envio = subtotal >= ENVIO_GRATIS_DESDE || esRetiro ? 0 : COSTO_ENVIO
  const total = subtotal + envio
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal

  return (
    <div className="card shadow-sm rounded-4 ms-4 p-3" style={{maxWidth: '100%'}}>
      <h4 className="mb-4 text-start">Resumen de compra</h4>
      <div className="card-entrega">
        <h5>Método de entrega</h5>
        <ItemTarjeta
          titulo="Retiro en distribuidora"
          icono={iconoEntregaLocal}
          texto="Av. Juan Gilberto Funes 460"
          descripcion="Listo en 2 horas"
          seleccionado={entrega === 'retiro'}
          onSelect={() => setEntrega('retiro')}
          />
        <ItemTarjeta
          titulo="Envío estándar"
          icono={iconoEntregaDomicilio}
          texto="Entrega a domicilio"
          descripcion="Se entregará en 1-2 días hábiles"
          seleccionado={entrega === 'estandar'}
          onSelect={() => setEntrega('estandar')}
          />
      </div>

      {!esRetiro && 
        (<EscogerUbicacion />)}

      <hr className="my-3 text-secondary opacity-25" />

      <div className="card-body">
        <dl className="row mb-0 text-start">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal} productos)</dt>
          <dd className="col-5 text-end fuente-titulos">{formatearPrecio(subtotal)}</dd>
          {!esRetiro && (
            <>
              <dt className="col-7 fw-normal">Envío</dt>
              <dd className="col-5 text-end fuente-titulos">{envio === 0 ? 'Gratis' : formatearPrecio(envio)}</dd>
            </>
          )}
          <div className="d-flex align-items-center border-top pt-2">
            <dt className="col-7">Total</dt>
            <dd className="col-5 text-end h2 fuente-titulos">{formatearPrecio(total)}</dd>
          </div>
        </dl>

        {!esRetiro && faltaParaEnvioGratis > 0 && (
          <p className="small text-body-secondary fuente-titulos">
            Te faltan {formatearPrecio(faltaParaEnvioGratis)} para el envío gratis.
          </p>
        )}

        <div className="d-grid gap-2 mt-3">
          <Boton variante="dark" onClick={() => onFinalizar(entrega)}>
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
