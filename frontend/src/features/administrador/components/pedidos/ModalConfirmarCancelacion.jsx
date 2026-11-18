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
    <Modal titulo="Cancelar Pedido" onCerrar={handleCerrar} tamanio="normal">
      <form onSubmit={handleSubmit} className="form-confirmacion-accion">
        <p className="mensaje-confirmacion">
          ¿Estás seguro de que deseas cancelar el pedido del comercio{' '}
          <strong>{pedido.comercio || 'N/A'}</strong>?
        </p>

        <div className="campo-grupo" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="motivo-rechazo" style={{ fontWeight: '600' }}>
            Motivo de cancelación <span style={{ color: 'var(--admin-peligro, #e53e3e)' }}>*</span>:
          </label>
          <textarea
            id="motivo-rechazo"
            rows="3"
            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:placeholder-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value)
              if (errorValidacion) setErrorValidacion('')
            }}
            placeholder="Ej. Falta de stock de producto solicitado, cliente no responde, etc."
            required
            disabled={cargando}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errorValidacion ? '1px solid var(--admin-peligro, #e53e3e)' : '1px solid #ccc',
              resize: 'vertical'
            }}
          />
          {errorValidacion && (
            <span style={{ color: 'var(--admin-peligro, #e53e3e)', fontSize: '0.85rem' }}>
              {errorValidacion}
            </span>
          )}
        </div>

        <div className="modal-acciones-footer" style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="orden-btn orden-btn-peligro"
            disabled={cargando}
          >
            {cargando ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
          <button
            type="button"
            className="orden-btn dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
            onClick={handleCerrar}
            disabled={cargando}
          >
            Volver
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalConfirmarCancelacion
