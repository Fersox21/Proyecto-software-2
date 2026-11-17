import Modal from '../comunes/Modal'
import { formatearPrecio } from '../../../../shared/utils/formato'

function ModalConfirmarAceptacion({ pedido, datosModificacion, visible, cargando, onConfirmar, onCerrar }) {
  if (!visible || !pedido) return null

  const totalFinal = datosModificacion?.totalModificado ?? pedido.totalModificado ?? pedido.total ?? 0

  return (
    <Modal titulo={`Aceptar Pedido #${pedido.id}`} onCerrar={onCerrar} tamanio="normal">
      <div className="form-confirmacion-accion">
        <p className="mensaje-confirmacion">
          ¿Deseas aceptar el pedido <strong>#{pedido.id}</strong> del comercio{' '}
          <strong>{pedido.comercio || 'N/A'}</strong>?
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'var(--admin-texto-secundario, #555)' }}>
          Al aceptar este pedido, se consolidará y registrará automáticamente como <strong>venta</strong> por un monto total de{' '}
          <strong>{formatearPrecio(totalFinal)}</strong>.
        </p>

        <div className="modal-acciones-footer" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            disabled={cargando}
            onClick={() => onConfirmar(pedido.id)}
          >
            {cargando ? 'Procesando Venta...' : 'Confirmar y Crear Venta'}
          </button>
          <button
            type="button"
            className="orden-btn"
            onClick={onCerrar}
            disabled={cargando}
          >
            Volver
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ModalConfirmarAceptacion
