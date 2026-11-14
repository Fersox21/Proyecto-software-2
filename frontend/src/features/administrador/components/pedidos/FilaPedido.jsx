import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'

function FilaPedido({ pedido, onVerDetalle, onIniciarAceptar, onIniciarCancelar }) {
  const estadoNormalizado = (pedido.estado || '').toLowerCase()
  const esPendiente = estadoNormalizado === 'pendiente' || estadoNormalizado === 'en_proceso'

  return (
    <tr>
      <td className="col-admin">#{pedido.id}</td>
      <td className="col-admin">{pedido.comercio || 'N/A'}</td>
      <td className="col-admin">{pedido.fecha ? formatearFecha(pedido.fecha) : 'N/A'}</td>
      <td className="col-admin">{pedido.total != null ? formatearPrecio(pedido.total) : '$0.00'}</td>
      <td className="col-admin">
        <span className="estado-texto-plano">
          {pedido.estado || 'Desconocido'}
        </span>
      </td>
      <td className="col-admin col-acciones">
        <div className="pedido-acciones">
          {esPendiente ? (
            <button
              type="button"
              className="orden-btn orden-btn-chico orden-btn-primario"
              onClick={() => onIniciarAceptar(pedido)}
            >
              Aceptar
            </button>
          ) : (
            <span className="pedido-accion-hueco" aria-hidden="true" />
          )}

          <button
            type="button"
            className="orden-btn orden-btn-chico"
            onClick={() => onVerDetalle(pedido.id)}
          >
            Ver Detalle
          </button>

          {esPendiente ? (
            <button
              type="button"
              className="orden-btn orden-btn-chico orden-btn-peligro"
              onClick={() => onIniciarCancelar(pedido)}
            >
              Cancelar
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
