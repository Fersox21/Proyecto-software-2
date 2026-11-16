import { useState } from 'react'
import CampoFormulario from '../comunes/CampoFormulario'

function ProveedorForm({ proveedor, onGuardar, onCerrar }) {
  const editando = Boolean(proveedor)

  const [valores, setValores] = useState({
    nombre: proveedor?.nombre ?? '',
    telefono: proveedor?.telefono ?? '',
  })

  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const actualizarCampo = (campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!valores.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del proveedor es obligatorio'
    }
    if (!valores.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono de contacto es obligatorio'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setErrorServidor(null)

    if (!validar()) return

    setGuardando(true)
    try {
      await onGuardar({
        nombre: valores.nombre.trim(),
        telefono: valores.telefono.trim(),
      })
    } catch (err) {
      setErrorServidor(err.message || 'No se pudo guardar el proveedor')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="orden-form" onSubmit={manejarEnvio} noValidate>
      <div className="orden-modal-cuerpo">
        {errorServidor && (
          <div className="orden-alerta orden-alerta-error" role="alert">
            <span>{errorServidor}</span>
          </div>
        )}

        <CampoFormulario label="Nombre del proveedor" id="proveedor-nombre" error={errores.nombre}>
          <input
            id="proveedor-nombre"
            type="text"
            placeholder="Ej. Distribuidora Central S.A."
            value={valores.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            disabled={guardando}
            autoFocus
          />
        </CampoFormulario>

        <CampoFormulario label="Teléfono de contacto" id="proveedor-telefono" error={errores.telefono}>
          <input
            id="proveedor-telefono"
            type="tel"
            placeholder="Ej. 011 4567-8901 o +54 9 11..."
            value={valores.telefono}
            onChange={(e) => actualizarCampo('telefono', e.target.value)}
            disabled={guardando}
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
            ? 'Actualizar proveedor'
            : 'Guardar proveedor'}
        </button>
      </div>
    </form>
  )
}

export default ProveedorForm
