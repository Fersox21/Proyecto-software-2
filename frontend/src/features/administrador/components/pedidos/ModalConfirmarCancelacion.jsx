import { useState } from 'react'
import Modal from '../comunes/Modal'

function ModalConfirmarCancelacion({ pedido, visible, cargando, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState('')
  const [errorValidacion, setErrorValidacion] = useState('')

  if (!visible || !pedido) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!motivo.trim()) {
      setErrorValidacion('Por favor ingresa un motivo para el rechazo o cancelación.')
      return
    }
    setErrorValidacion('')
    onConfirmar(pedido.id, motivo.trim())
  }

  const handleCerrar = () => {
    setMotivo('')
    setErrorValidacion('')
    onCerrar()
  }

  return (
    <Modal titulo="Cancelar Pedido" onCerrar={handleCerrar} tamanio="chico">
      <form onSubmit={handleSubmit} className="orden-form">
        <div className="orden-modal-cuerpo">
          <p className="orden-confirmar-texto">
            ¿Estás seguro de que deseas cancelar el pedido del comercio{' '}
            <strong>{pedido.comercio || 'N/A'}</strong>?
          </p>

          <div className="orden-campo">
            <label htmlFor="motivo-rechazo">
              Motivo de cancelación <span style={{ color: 'var(--admin-peligro)' }}>*</span>
            </label>
            <textarea
              id="motivo-rechazo"
              rows="3"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                if (errorValidacion) setErrorValidacion('')
              }}
              placeholder="Ej. Falta de stock de producto solicitado, cliente no responde, etc."
              required
              disabled={cargando}
              aria-invalid={Boolean(errorValidacion)}
            />
            {errorValidacion && (
              <p className="orden-campo-error" role="alert">
                {errorValidacion}
              </p>
            )}
          </div>
        </div>

        <div className="orden-modal-acciones">
          <button
            type="button"
            className="orden-btn"
            onClick={handleCerrar}
            disabled={cargando}
          >
            Volver
          </button>
          <button
            type="submit"
            className="orden-btn orden-btn-peligro"
            disabled={cargando}
          >
            {cargando ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalConfirmarCancelacion
