import Modal from '../comunes/Modal'

function ConfirmarEliminacionProveedor({
  proveedor,
  eliminando,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal titulo="Eliminar proveedor" onCerrar={onCancelar} tamanio="chico">
      <div className="orden-modal-cuerpo">
        <p className="orden-confirmar-texto">
          ¿Seguro que querés eliminar al proveedor{' '}
          <strong>{proveedor.nombre}</strong>?
        </p>
        <p className="orden-confirmar-detalle">
          Teléfono: {proveedor.telefono || 'Sin teléfono'}
        </p>
      </div>

      <div className="orden-modal-acciones">
        <button
          type="button"
          className="orden-btn dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
          onClick={onCancelar}
          disabled={eliminando}
        >
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

export default ConfirmarEliminacionProveedor
