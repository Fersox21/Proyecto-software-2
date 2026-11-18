import Modal from '../comunes/Modal'

function nombreProducto(lote) {
  if (lote?.producto?.nombre) return lote.producto.nombre
  return 'Sin producto'
}

function ConfirmarEliminacionLote({ lote, eliminando, onConfirmar, onCancelar }) {
  return (
    <Modal titulo="Dar de baja el lote" onCerrar={onCancelar} tamanio="chico">
      <div className="orden-modal-cuerpo">
        <p className="orden-confirmar-texto">
          ¿Seguro que querés dar de baja este lote?
        </p>
        <p className="orden-confirmar-detalle">Producto: {nombreProducto(lote)}</p>
        <p className="orden-confirmar-detalle">
          El lote dejará de estar disponible en el sistema.
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
          {eliminando ? 'Dando de baja...' : 'Dar de baja'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmarEliminacionLote
