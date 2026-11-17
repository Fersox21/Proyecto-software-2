import { useState } from 'react'
import Modal from '../comunes/Modal'
import DetallePedidoInfo from './DetallePedidoInfo'
import DetallePedidoItems from './DetallePedidoItems'
import Spinner from '../../../../shared/components/Spinner'
import { formatearPrecio } from '../../../../shared/utils/formato'
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
} from '../../../../shared/utils/validaciones'

function DetallePedidoContenido({
  pedido,
  procesandoAccion,
  onCerrar,
  onIniciarAceptar,
  onIniciarCancelar,
  onGuardarModificacion,
}) {
  const valorInicial = pedido.totalModificado != null ? pedido.totalModificado : pedido.total
  const [precioFinal, setPrecioFinal] = useState(valorInicial != null ? String(valorInicial) : '')
  const [motivoModificacion, setMotivoModificacion] = useState(pedido.motivoModificacion || '')
  const [errorValidacion, setErrorValidacion] = useState('')

  const items = pedido?.items || pedido?.tiene || pedido?.productos || []
  const estadoNormalizado = (pedido?.estado || '').toLowerCase()
  const esPendiente =
    estadoNormalizado === 'pendiente' ||
    estadoNormalizado === 'en_proceso' ||
    estadoNormalizado === 'nuevo'

  const totalOriginal = Number(pedido?.total ?? 0)
  const precioIngresadoStr = String(precioFinal ?? '').trim()
  const precioIngresado = Number(precioIngresadoStr)
  const precioModificado =
    precioIngresadoStr !== '' &&
    Number.isFinite(precioIngresado) &&
    precioIngresado !== totalOriginal

  const validarModificacion = () => {
    if (precioIngresadoStr !== '' && (!Number.isFinite(precioIngresado) || precioIngresado <= 0)) {
      setErrorValidacion('El precio final debe ser mayor a 0.')
      return { valido: false, datos: null }
    }

    if (precioModificado) {
      if (!motivoModificacion.trim()) {
        setErrorValidacion('Ingresá el motivo de la modificación del precio.')
        return { valido: false, datos: null }
      }
      return {
        valido: true,
        datos: {
          totalModificado: precioIngresado,
          motivoModificacion: motivoModificacion.trim(),
        },
      }
    }

    if (pedido.totalModificado != null) {
      return {
        valido: true,
        datos: {
          totalModificado: null,
          motivoModificacion: null,
        },
      }
    }

    return { valido: true, datos: null }
  }

  const handleGuardar = async () => {
    const { valido, datos } = validarModificacion()
    if (!valido || !datos || !onGuardarModificacion) return
    try {
      await onGuardarModificacion(pedido.id, datos)
    } catch (err) {
      setErrorValidacion(err.message || 'No se pudo guardar la modificación.')
    }
  }

  const handleAceptar = () => {
    const { valido, datos } = validarModificacion()
    if (!valido) return
    onIniciarAceptar(pedido, datos)
  }

  return (
    <div className="detalle-pedido-modal-contenido">
      <DetallePedidoInfo pedido={pedido} />
      <DetallePedidoItems items={items} total={pedido.total || 0} />

      {pedido.totalModificado != null && (
        <div className="detalle-campo detalle-campo-alerta">
          <span className="detalle-valor">
            Total: {formatearPrecio(pedido.total || 0)} (Modificado a: {formatearPrecio(pedido.totalModificado)})
          </span>
          {pedido.motivoModificacion && (
            <span className="detalle-etiqueta motivo-texto">
              Motivo: {pedido.motivoModificacion}
            </span>
          )}
        </div>
      )}

      {esPendiente && (
        <div className="detalle-pedido-seccion">
          <h3 className="detalle-subtitulo">Ajuste de Precio Final</h3>
          {errorValidacion && (
            <div className="orden-alerta orden-alerta-error">
              {errorValidacion}
            </div>
          )}
          <div className="orden-form-grilla">
            <div className="orden-campo">
              <label htmlFor="modificar-precio-final">Modificar Precio Final</label>
              <input
                id="modificar-precio-final"
                className="detalle-input-precio"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder={String(totalOriginal)}
                value={precioFinal}
                onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                onChange={(e) => {
                  setPrecioFinal(sanitizarDecimalPositivo(e.target.value))
                  setErrorValidacion('')
                }}
              />
            </div>

            {precioModificado && (
              <div className="orden-campo">
                <label htmlFor="motivo-modificacion-precio">Motivo de la modificación</label>
                <input
                  id="motivo-modificacion-precio"
                  className="detalle-input-motivo"
                  type="text"
                  placeholder="Explicá el motivo del ajuste..."
                  value={motivoModificacion}
                  onChange={(e) => {
                    setMotivoModificacion(e.target.value)
                    setErrorValidacion('')
                  }}
                />
              </div>
            )}
          </div>

          {(precioModificado || pedido.totalModificado != null) && onGuardarModificacion && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="orden-btn detalle-btn-neutral"
                disabled={procesandoAccion}
                onClick={handleGuardar}
              >
                {procesandoAccion ? 'Guardando...' : 'Guardar modificación'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="modal-acciones-footer">
        {esPendiente && (
          <>
            <button
              type="button"
              className="orden-btn orden-btn-primario detalle-btn-primario"
              disabled={procesandoAccion}
              onClick={handleAceptar}
            >
              Aceptar Pedido (Convertir a Venta)
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-peligro detalle-btn-peligro"
              disabled={procesandoAccion}
              onClick={() => onIniciarCancelar(pedido)}
            >
              Cancelar Pedido
            </button>
          </>
        )}
        <button type="button" className="orden-btn detalle-btn-neutral" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

function DetallePedidoModal({
  pedido,
  cargando,
  error,
  procesandoAccion,
  onCerrar,
  onIniciarAceptar,
  onIniciarCancelar,
  onGuardarModificacion,
}) {
  if (!pedido && !cargando && !error) return null

  return (
    <Modal titulo={pedido ? 'Detalle de Pedido' : 'Cargando Pedido'} onCerrar={onCerrar} tamanio="grande">
      {cargando ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Spinner texto="Cargando detalles del pedido..." />
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: 'var(--admin-peligro, #e53e3e)' }}>
          <p>{error}</p>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button type="button" className="orden-btn" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <DetallePedidoContenido
          key={`${pedido.id}-${pedido.total}-${pedido.totalModificado ?? ''}-${pedido.motivoModificacion ?? ''}`}
          pedido={pedido}
          procesandoAccion={procesandoAccion}
          onCerrar={onCerrar}
          onIniciarAceptar={onIniciarAceptar}
          onIniciarCancelar={onIniciarCancelar}
          onGuardarModificacion={onGuardarModificacion}
        />
      )}
    </Modal>
  )
}

export default DetallePedidoModal
