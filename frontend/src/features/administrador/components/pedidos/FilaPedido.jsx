import { LuCheck, LuEye, LuX } from 'react-icons/lu'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'

function FilaPedido({ pedido, numeroFila, onVerDetalle, onIniciarAceptar, onIniciarCancelar }) {
  const estadoNormalizado = (pedido.estado || '').toLowerCase()
  const esPendiente = ['pendiente', 'nuevo', 'en_proceso'].includes(estadoNormalizado)
  const esAlertaEstado = estadoNormalizado === 'pendiente' || estadoNormalizado === 'nuevo'

  return (
    <tr>
      <td className="col-admin">
        <div className="pedido-cliente-celda">
          <span className="pedido-comercio-nombre">{pedido.comercio || 'N/A'}</span>
          <span className="pedido-id-subtitulo">Pedido #{numeroFila}</span>
        </div>
      </td>
      <td className="col-admin">{pedido.fecha ? formatearFecha(pedido.fecha) : 'N/A'}</td>
      <td className="col-admin">
        {pedido.totalModificado != null ? (
          <div className="pedido-total-modificado">
            <span className="pedido-total-destacado">
              {formatearPrecio(pedido.totalModificado)}
            </span>
            <span className="pedido-total-original">
              Original: {formatearPrecio(pedido.total || 0)}
            </span>
            {pedido.motivoModificacion && (
              <span className="detalle-etiqueta">
                Motivo: {pedido.motivoModificacion}
              </span>
            )}
          </div>
        ) : (
          <span className="pedido-total-destacado">
            {pedido.total != null ? formatearPrecio(pedido.total) : '$0.00'}
          </span>
        )}
      </td>
      <td className="col-admin">
        <span
          className={`pedido-estado-chip ${
            esAlertaEstado ? 'pedido-estado-pendiente' : 'pedido-estado-neutro'
          }`}
        >
          {pedido.estado || 'Desconocido'}
        </span>
      </td>
      <td className="col-admin col-acciones">
        <div className="pedido-acciones">
          {esPendiente ? (
            <button
              type="button"
              className="pedido-btn-icono pedido-btn-aceptar"
              onClick={() => onIniciarAceptar(pedido)}
              aria-label={`Aceptar pedido #${numeroFila}`}
              title="Aceptar pedido"
            >
              <LuCheck size={17} aria-hidden="true" />
            </button>
          ) : (
            <span className="pedido-accion-hueco" aria-hidden="true" />
          )}

          <button
            type="button"
            className="pedido-btn-icono pedido-btn-detalle"
            onClick={() => onVerDetalle(pedido.id)}
            aria-label={`Ver detalle del pedido #${numeroFila}`}
            title="Ver detalle"
          >
            <LuEye size={17} aria-hidden="true" />
          </button>

          {esPendiente ? (
            <button
              type="button"
              className="pedido-btn-icono pedido-btn-cancelar"
              onClick={() => onIniciarCancelar(pedido)}
              aria-label={`Cancelar pedido #${numeroFila}`}
              title="Cancelar pedido"
            >
              <LuX size={17} aria-hidden="true" />
            </button>
          ) : (
            <span className="pedido-accion-hueco" aria-hidden="true" />
          )}
        </div>
      </td>
    </tr>
  )
}

export default FilaPedido
