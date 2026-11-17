import { useState } from 'react'
import Modal from '../comunes/Modal'
import CampoFormulario from '../comunes/CampoFormulario'

function ModalFormCategoria({ categoria, onGuardar, onCerrar }) {
  const editando = Boolean(categoria)

  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [errorCampo, setErrorCampo] = useState(null)
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const validar = () => {
    const limpio = nombre.trim()
    if (!limpio) {
      setErrorCampo('El nombre de la categoría es obligatorio')
      return false
    }
    if (limpio.length > 100) {
      setErrorCampo('El nombre de la categoría no puede superar los 100 caracteres')
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
      setErrorServidor(err.message || 'No se pudo guardar la categoría')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
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
            label="Nombre de la categoría"
            id="categoria-nombre"
            error={errorCampo}
          >
            <input
              id="categoria-nombre"
              type="text"
              placeholder="Ej. Almacén"
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
              ? 'Actualizar categoría'
              : 'Guardar categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalFormCategoria
