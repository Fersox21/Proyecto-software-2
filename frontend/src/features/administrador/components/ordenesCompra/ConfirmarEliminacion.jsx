import Modal from './Modal'

function ConfirmarEliminacion({ orden, eliminando, onConfirmar, onCancelar }) {
  return (
    <Modal titulo="Eliminar orden de compra" onCerrar={onCancelar} tamanio="chico">
      <div className="orden-modal-cuerpo">
        <p className="orden-confirmar-texto">
          ¿Seguro que querés eliminar la orden <strong>#{orden.id}</strong>? También se van a eliminar
          todos sus lotes.
        </p>
        <p className="orden-confirmar-detalle">
          Proveedor: {orden.proveedor?.nombre || `#${orden.proveedor?.id ?? 'sin datos'}`}
        </p>
      </div>

      <div className="orden-modal-acciones">
        <button type="button" className="orden-btn" onClick={onCancelar} disabled={eliminando}>
          Cancelar
        </button>
        <button
          type="button"
          className="orden-btn orden-btn-peligro"
          onClick={onConfirmar}
          disabled={eliminando}
        >
          {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmarEliminacion
