import Modal from '../comunes/Modal'

function nombreProducto(lote) {
  if (lote?.producto?.nombre) return lote.producto.nombre
  if (lote?.producto?.id != null) return `Producto #${lote.producto.id}`
  return 'Sin producto'
}

function ConfirmarEliminacionLote({ lote, eliminando, onConfirmar, onCancelar }) {
  return (
    <Modal titulo="Dar de baja el lote" onCerrar={onCancelar} tamanio="chico">
      <div className="orden-modal-cuerpo">
        <p className="orden-confirmar-texto">
          ¿Seguro que querés dar de baja el lote <strong>#{lote.id}</strong>?
        </p>
        <p className="orden-confirmar-detalle">Producto: {nombreProducto(lote)}</p>
        <p className="orden-confirmar-detalle">
          Orden de compra: {lote.ordenCompra?.id != null ? `#${lote.ordenCompra.id}` : '—'}
        </p>
        <p className="orden-confirmar-detalle">
          El lote dejará de estar disponible en el sistema.
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
          {eliminando ? 'Dando de baja...' : 'Dar de baja'}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmarEliminacionLote
