import { useState } from 'react'
import { crearProveedor } from '../../services/ordenesCompraService'

const REGEX_TELEFONO = /^\+?\d+$/

function sanitizarTelefono(valor) {
  return valor.replace(/(?!^\+)[^\d]/g, '')
}

function NuevoProveedorInlineForm({ onProveedorCreado, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [errores, setErrores] = useState({})
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  function manejarCambioTelefono(e) {
    const limpio = sanitizarTelefono(e.target.value)
    setTelefono(limpio)
    if (errores.telefono) {
      setErrores((prev) => ({ ...prev, telefono: null }))
    }
  }

  function validar() {
    const nuevosErrores = {}
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del proveedor es obligatorio'
    }
    if (!telefono) {
      nuevosErrores.telefono = 'El teléfono es obligatorio'
    } else if (!REGEX_TELEFONO.test(telefono)) {
      nuevosErrores.telefono =
        'El teléfono solo puede contener dígitos y un + opcional al inicio (sin espacios ni guiones)'
    }
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function manejarCrear() {
    setErrorServidor(null)
    if (!validar()) return

    setGuardando(true)
    try {
      const nuevo = await crearProveedor({
        nombre: nombre.trim(),
        telefono,
      })
      onProveedorCreado(nuevo)
    } catch (err) {
      setErrorServidor(err.message || 'No se pudo crear el proveedor')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="orden-proveedor-inline"
      role="group"
      aria-label="Nuevo proveedor"
    >
      <div className="orden-producto-inline-cabecera">
        <h4 className="orden-producto-inline-titulo">Nuevo proveedor</h4>
      </div>

      {errorServidor && (
        <div className="orden-alerta orden-alerta-error orden-proveedor-inline-alerta" role="alert">
          {errorServidor}
        </div>
      )}

      <div className="orden-producto-inline-grilla">
        <div className="orden-campo">
          <label htmlFor="orden-nuevo-proveedor-nombre">Nombre *</label>
          <input
            id="orden-nuevo-proveedor-nombre"
            type="text"
            placeholder="Ej. Distribuidora Central"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: null }))
            }}
            disabled={guardando}
            aria-invalid={Boolean(errores.nombre)}
          />
          {errores.nombre && <p className="orden-campo-error">{errores.nombre}</p>}
        </div>

        <div className="orden-campo">
          <label htmlFor="orden-nuevo-proveedor-telefono">Teléfono *</label>
          <input
            id="orden-nuevo-proveedor-telefono"
            type="tel"
            inputMode="tel"
            placeholder="Ej. +5491122334455"
            value={telefono}
            onChange={manejarCambioTelefono}
            disabled={guardando}
            aria-invalid={Boolean(errores.telefono)}
          />
          {errores.telefono && <p className="orden-campo-error">{errores.telefono}</p>}
        </div>
      </div>

      <div className="orden-proveedor-inline-acciones">
        <button
          type="button"
          className="orden-btn orden-btn-chico"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="orden-btn orden-btn-chico orden-btn-primario"
          onClick={manejarCrear}
          disabled={guardando}
        >
          {guardando ? 'Creando...' : 'Crear proveedor'}
        </button>
      </div>
    </div>
  )
}

export default NuevoProveedorInlineForm
