import { FaRegClock } from 'react-icons/fa'
import { Bs2CircleFill } from 'react-icons/bs'
import ItemTarjeta from '../../../shared/components/ItemTarjeta'
import EscogerUbicacion from '../../carrito/components/EscogerUbicacion'
import iconoEntregaLocal from '../../../assets/Items/iconoEntregaLocal.svg'
import iconoEntregaDomicilio from '../../../assets/Items/iconoEntregaDomicilio.svg'

function MetodoEntregaForm({
  entrega,
  onSeleccionarEntrega,
  datosPedido,
  onChange,
  onDireccionChange,
  esRetiro,
  esEnvio
}) {
  return (
    <div className="card rounded-5 p-4 border-0 shadow-sm">
      <div className="card-entrega">
        <div className="d-flex gap-2">
          <Bs2CircleFill size={33} className="text-dark mb-2" />
          <div>
            <h5 className="fw-bold">Método de entrega</h5>
            <p className="small">Elegí si retirás por la distribuidora o te lo enviamos.</p>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 col-md-6">
            <ItemTarjeta
              titulo="Retiro en distribuidora"
              icono={iconoEntregaLocal}
              texto="Av. Juan Gilberto Funes 460"
              descripcion="Listo en 2 horas"
              seleccionado={entrega === 'retiro'}
              onSelect={() => onSeleccionarEntrega('retiro')}
            />
          </div>
          <div className="col-12 col-md-6">
            <ItemTarjeta
              titulo="Envío estándar"
              icono={iconoEntregaDomicilio}
              texto="Entrega a domicilio"
              descripcion="Se entregará en 1-2 días hábiles"
              seleccionado={entrega === 'estandar'}
              onSelect={() => onSeleccionarEntrega('estandar')}
            />
          </div>
        </div>
      </div>

      {esRetiro && (
        <div className="bg-secondary-subtle rounded-4 px-4 py-2 m-auto">
          <FaRegClock />
          <p className="m-2 d-inline">Horario</p>
          <p className="small my-2">Lunes a Viernes 8:00-16:00 · Sábado 9:00-13:00</p>
        </div>
      )}

      {esEnvio && (
        <>
          <EscogerUbicacion
            direccion={datosPedido.direccion}
            onDireccionChange={onDireccionChange}
          />
          <div className="mt-2">
            <label className="form-label small fw-semibold">
              Información adicional para llegar a la ubicación
            </label>
            <textarea
              name="descripcionDireccion"
              rows={3}
              className="form-control input-form"
              value={datosPedido.descripcionDireccion}
              style={{ resize: 'none' }}
              onChange={onChange}
            />
            <p className="small">Ej. Es sobre el pasaje Sarmiento</p>
          </div>
        </>
      )}
    </div>
  )
}

export default MetodoEntregaForm
