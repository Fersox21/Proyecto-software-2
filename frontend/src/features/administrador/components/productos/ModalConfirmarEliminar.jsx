import Modal from '../comunes/Modal'

function ModalConfirmarEliminar({ producto, visible, eliminando, onConfirmar, onCerrar }) {
  if (!visible || !producto) return null

  return (
    <Modal titulo="Eliminar Producto" onCerrar={onCerrar} tamanio="chico">
      <div className="orden-modal-cuerpo">
        <p className="orden-confirmar-texto">
          ¿Estás seguro de que deseás eliminar el producto{' '}
          <strong>{producto.nombre}</strong> (ID #{producto.id})?
        </p>
        <p className="orden-confirmar-detalle" style={{ marginTop: '0.5rem', color: 'var(--admin-texto-secundario)' }}>
          Marca: {producto.marca} | Stock: {producto.stock}
        </p>
      </div>

      <div className="orden-modal-acciones">
        <button
          type="button"
          className="orden-btn"
          onClick={onCerrar}
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

export default ModalConfirmarEliminar
