import Modal from './Modal'
import DetallePedidoInfo from './DetallePedidoInfo'
import DetallePedidoItems from './DetallePedidoItems'
import Spinner from '../../../shared/components/Spinner'

function DetallePedidoModal({ pedido, cargando, error, onCerrar, onIniciarAceptar, onIniciarCancelar }) {
  if (!pedido && !cargando && !error) return null

  const items = pedido?.items || pedido?.tiene || pedido?.productos || []
  const estadoNormalizado = (pedido?.estado || '').toLowerCase()
  const esPendiente = estadoNormalizado === 'pendiente' || estadoNormalizado === 'en_proceso'

  return (
    <Modal titulo={pedido ? `Detalle de Pedido #${pedido.id}` : 'Cargando Pedido'} onCerrar={onCerrar} tamanio="grande">
      {cargando ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner texto="Cargando detalles del pedido..." />
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--admin-peligro, #e53e3e)' }}>
          <p>{error}</p>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button type="button" className="orden-btn" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="detalle-pedido-modal-contenido">
          <DetallePedidoInfo pedido={pedido} />
          <DetallePedidoItems items={items} total={pedido.total || 0} />

          <div className="modal-acciones-footer">
            {esPendiente && (
              <>
                <button
                  type="button"
                  className="orden-btn orden-btn-primario"
                  onClick={() => onIniciarAceptar(pedido)}
                >
                  Aceptar Pedido (Convertir a Venta)
                </button>
                <button
                  type="button"
                  className="orden-btn orden-btn-peligro"
                  onClick={() => onIniciarCancelar(pedido)}
                >
                  Cancelar Pedido
                </button>
              </>
            )}
            <button type="button" className="orden-btn" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default DetallePedidoModal
