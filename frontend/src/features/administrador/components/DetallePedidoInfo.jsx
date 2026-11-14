import { formatearFecha } from '../../../shared/utils/formato'

function DetallePedidoInfo({ pedido }) {
  if (!pedido) return null

  return (
    <div className="detalle-pedido-seccion">
      <h3 className="detalle-subtitulo">Información General</h3>
      <div className="detalle-grid">
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Comercio:</span>
          <span className="detalle-valor">{pedido.comercio || 'No especificado'}</span>
        </div>
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Fecha de Pedido:</span>
          <span className="detalle-valor">
            {pedido.fecha ? formatearFecha(pedido.fecha) : 'No especificada'}
          </span>
        </div>
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Modalidad de Entrega:</span>
          <span className="detalle-valor">{pedido.modalidadEntrega || 'No especificada'}</span>
        </div>
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Dirección de Entrega:</span>
          <span className="detalle-valor">{pedido.direccion || 'No especificada'}</span>
        </div>
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Método de Pago:</span>
          <span className="detalle-valor">{pedido.metodoPago || 'No especificado'}</span>
        </div>
        <div className="detalle-campo">
          <span className="detalle-etiqueta">Estado Actual:</span>
          <span className="estado-texto-plano">
            {pedido.estado || 'Desconocido'}
          </span>
        </div>
        {pedido.motivoRechazo && (
          <div className="detalle-campo detalle-campo-alerta">
            <span className="detalle-etiqueta">Motivo de Cancelación/Rechazo:</span>
            <span className="detalle-valor motivo-texto">{pedido.motivoRechazo}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default DetallePedidoInfo
