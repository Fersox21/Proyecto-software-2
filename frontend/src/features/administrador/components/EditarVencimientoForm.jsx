import { useState } from 'react'
import { formatearFecha } from '../../../shared/utils/formato'
import { hoyISO, soloFecha } from '../utils/vencimientos'

function EditarVencimientoForm({ lote, onGuardar, onCerrar }) {
  const fechaActual = soloFecha(lote.fechaVencimiento)
  const fechaArribo = soloFecha(lote.fechaArribo)

  const [fecha, setFecha] = useState(fechaActual)
  const [error, setError] = useState(null)
  const [errorServidor, setErrorServidor] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const hoy = hoyISO()
  const sinCambios = fecha === fechaActual
  const aviso = sinCambios
    ? 'La fecha no cambió.'
    : fecha && fecha < hoy
      ? 'La nueva fecha ya está vencida.'
      : null

  function cambiarFecha(valor) {
    setFecha(valor)
    setError(null)
  }

  function validar() {
    if (!fecha) {
      setError('La fecha de vencimiento es obligatoria')
      return false
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(`${fecha}T00:00:00`))) {
      setError('Ingresá una fecha válida')
      return false
    }

    if (fechaArribo && fecha < fechaArribo) {
      setError(`No puede ser anterior a la fecha de arribo (${formatearFecha(fechaArribo)})`)
      return false
    }

    setError(null)
    return true
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setErrorServidor(null)

    if (sinCambios || !validar()) return

    setGuardando(true)

    try {
      await onGuardar(fecha)
    } catch (nuevoError) {
      setErrorServidor(nuevoError.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="orden-form" onSubmit={manejarEnvio} noValidate>
      <div className="orden-modal-cuerpo">
        {errorServidor && (
          <div className="orden-alerta orden-alerta-error" role="alert">
            {errorServidor}
          </div>
        )}

        <dl className="venc-editor-contexto">
          <div>
            <dt>Producto</dt>
            <dd>{lote.productoNombre}</dd>
          </div>
          <div>
            <dt>Proveedor</dt>
            <dd>{lote.proveedorNombre}</dd>
          </div>
          <div>
            <dt>Cantidad</dt>
            <dd>{lote.cantidad ?? '—'}</dd>
          </div>
          <div>
            <dt>Fecha de arribo</dt>
            <dd>{formatearFecha(fechaArribo)}</dd>
          </div>
          <div>
            <dt>Vencimiento actual</dt>
            <dd>{formatearFecha(fechaActual)}</dd>
          </div>
        </dl>

        <div className="orden-campo">
          <label htmlFor="venc-nueva-fecha">Nueva fecha de vencimiento</label>
          <input
            id="venc-nueva-fecha"
            data-autofocus
            type="date"
            value={fecha}
            min={fechaArribo || undefined}
            onChange={(evento) => cambiarFecha(evento.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? 'venc-error-fecha' : aviso ? 'venc-ayuda-fecha' : undefined
            }
          />
          {error && (
            <p className="orden-campo-error" id="venc-error-fecha">
              {error}
            </p>
          )}
          {!error && aviso && (
            <p className="venc-aviso" id="venc-ayuda-fecha">
              {aviso}
            </p>
          )}
        </div>
      </div>

      <div className="orden-modal-acciones">
        <button type="button" className="orden-btn" onClick={onCerrar} disabled={guardando}>
          Cancelar
        </button>
        <button
          type="submit"
          className="orden-btn orden-btn-primario"
          disabled={guardando || sinCambios}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

export default EditarVencimientoForm
