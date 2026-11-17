import { useState } from 'react'
import Modal from '../comunes/Modal'
import CampoFormulario from '../comunes/CampoFormulario'

function ModalFormPromocion({ promocion, onGuardar, onCerrar }) {
  const editando = Boolean(promocion)

  const [nombre, setNombre] = useState(promocion?.nombre ?? '')
  const [errorCampo, setErrorCampo] = useState(null)
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const validar = () => {
    const limpio = nombre.trim()
    if (!limpio) {
      setErrorCampo('El nombre de la promoción es obligatorio')
      return false
    }
    if (limpio.length > 100) {
      setErrorCampo('El nombre de la promoción no puede superar los 100 caracteres')
      return false
    }
    setErrorCampo(null)
    return true
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setErrorServidor(null)

    if (!validar()) return

    setGuardando(true)
    try {
      await onGuardar({ nombre: nombre.trim() })
    } catch (err) {
      setErrorServidor(err.message || 'No se pudo guardar la promoción')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar promoción' : 'Nueva promoción'}
      onCerrar={onCerrar}
      tamanio="chico"
    >
      <form className="orden-form" onSubmit={manejarEnvio} noValidate>
        <div className="orden-modal-cuerpo">
          {errorServidor && (
            <div className="orden-alerta orden-alerta-error" role="alert">
              <span>{errorServidor}</span>
            </div>
          )}

          <CampoFormulario
            label="Nombre del tipo de promoción"
            id="promocion-nombre"
            error={errorCampo}
          >
            <input
              id="promocion-nombre"
              type="text"
              placeholder="Ej. 2x1, Descuento por volumen"
              maxLength={100}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                if (errorCampo) setErrorCampo(null)
              }}
              disabled={guardando}
              autoFocus
            />
          </CampoFormulario>
        </div>

        <div className="orden-modal-acciones">
          <button
            type="button"
            className="orden-btn"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="orden-btn orden-btn-primario"
            disabled={guardando}
          >
            {guardando
              ? editando
                ? 'Actualizando...'
                : 'Guardando...'
              : editando
              ? 'Actualizar promoción'
              : 'Guardar promoción'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalFormPromocion
