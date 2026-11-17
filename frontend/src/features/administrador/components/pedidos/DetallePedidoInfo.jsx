import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { obtenerClaseEstadoChip } from '../../utils/estadoPedido'

function DetallePedidoInfo({ pedido }) {
  if (!pedido) return null

  const subtotal = pedido.subtotal != null ? formatearPrecio(pedido.subtotal) : null
  const envio = pedido.envio != null ? formatearPrecio(pedido.envio) : null

  return (
    <div className="detalle-pedido-seccion">
      <h3 className="detalle-subtitulo">Información General</h3>
      <div className="detalle-info-tarjeta">
        <div className="detalle-grid">
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Comercio</span>
            <span className="detalle-valor">{pedido.comercio || 'No especificado'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Fecha de Pedido</span>
            <span className="detalle-valor">
              {pedido.fecha ? formatearFecha(pedido.fecha) : 'No especificada'}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Teléfono</span>
            <span className="detalle-valor">{pedido.telefono || 'No especificado'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Persona de contacto</span>
            <span className="detalle-valor">{pedido.personaContacto || 'No especificada'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Modalidad de Entrega</span>
            <span className="detalle-valor">{pedido.modalidadEntrega || 'No especificada'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Dirección de Entrega</span>
            <span className="detalle-valor">{pedido.direccion || 'No especificada'}</span>
          </div>
          {pedido.descripcionDireccion && (
            <div className="detalle-campo">
              <span className="detalle-etiqueta">Referencia de la dirección</span>
              <span className="detalle-valor">{pedido.descripcionDireccion}</span>
            </div>
          )}
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Método de Pago</span>
            <span className="detalle-valor">{pedido.metodoPago || 'No especificado'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Subtotal</span>
            <span className="detalle-valor">{subtotal ?? 'No especificado'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Envío</span>
            <span className="detalle-valor">{envio ?? 'No especificado'}</span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Total</span>
            <span className="detalle-valor">
              {pedido.totalModificado != null
                ? `Total: ${formatearPrecio(pedido.total || 0)} (Modificado a: ${formatearPrecio(pedido.totalModificado)})`
                : (pedido.total != null ? formatearPrecio(pedido.total) : 'No especificado')}
            </span>
          </div>
          <div className="detalle-campo">
            <span className="detalle-etiqueta">Estado Actual</span>
            <div>
              <span className={`pedido-estado-chip ${obtenerClaseEstadoChip(pedido.estado)}`}>
                {pedido.estado || 'Desconocido'}
              </span>
            </div>
          </div>
          {pedido.totalModificado != null && pedido.motivoModificacion && (
            <div className="detalle-campo detalle-campo-alerta">
              <span className="detalle-etiqueta">Motivo de Modificación de Total</span>
              <span className="detalle-valor motivo-texto">{pedido.motivoModificacion}</span>
            </div>
          )}
          {pedido.motivoRechazo && (
            <div className="detalle-campo detalle-campo-alerta">
              <span className="detalle-etiqueta">Motivo de Cancelación/Rechazo</span>
              <span className="detalle-valor motivo-texto">{pedido.motivoRechazo}</span>
            </div>
          )}
          {pedido.observaciones && (
            <div className="detalle-campo detalle-campo-ancho">
              <span className="detalle-etiqueta">Observaciones del pedido</span>
              <span className="detalle-valor">{pedido.observaciones}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetallePedidoInfo
