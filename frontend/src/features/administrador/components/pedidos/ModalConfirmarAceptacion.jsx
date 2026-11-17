import { useEffect, useState } from 'react'
import Modal from '../comunes/Modal'
import Spinner from '../../../../shared/components/Spinner'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { obtenerLotesDisponibles } from '../../services/pedidosService'

function ModalConfirmarAceptacion({
  pedido,
  datosModificacion,
  visible,
  cargando,
  onConfirmar,
  onCerrar,
}) {
  const [lotesPorProducto, setLotesPorProducto] = useState([])
  const [cargandoLotes, setCargandoLotes] = useState(false)
  const [errorLotes, setErrorLotes] = useState(null)

  // Estado de configuración por producto: { [productoId]: { modo: 'auto' | 'manual', seleccionados: [loteId] } }
  const [configuraciones, setConfiguraciones] = useState({})

  useEffect(() => {
    if (!visible || !pedido?.id) {
      setLotesPorProducto([])
      setConfiguraciones({})
      setErrorLotes(null)
      return
    }

    let ignorar = false
    setCargandoLotes(true)
    setErrorLotes(null)

    obtenerLotesDisponibles(pedido.id)
      .then((data) => {
        if (ignorar) return
        const lista = Array.isArray(data) ? data : []
        setLotesPorProducto(lista)

        // Configuración inicial por defecto: todos en modo 'auto'
        const initialConfig = {}
        lista.forEach((p) => {
          initialConfig[p.productoId] = {
            modo: 'auto',
            seleccionados: [],
          }
        })
        setConfiguraciones(initialConfig)
      })
      .catch((err) => {
        if (!ignorar) setErrorLotes(err.message || 'Error al cargar lotes disponibles')
      })
      .finally(() => {
        if (!ignorar) setCargandoLotes(false)
      })

    return () => {
      ignorar = true
    }
  }, [visible, pedido?.id])

  if (!visible || !pedido) return null

  const totalFinal =
    datosModificacion?.totalModificado ?? pedido.totalModificado ?? pedido.total ?? 0

  const cambiarModo = (productoId, modo) => {
    setConfiguraciones((prev) => ({
      ...prev,
      [productoId]: {
        modo,
        seleccionados: [],
      },
    }))
  }

  const toggleLoteSeleccionado = (productoId, loteId, cantidadRequerida, todosLotes) => {
    setConfiguraciones((prev) => {
      const config = prev[productoId] || { modo: 'manual', seleccionados: [] }
      const actual = config.seleccionados || []
      const existe = actual.includes(loteId)

      let nuevosSeleccionados
      if (existe) {
        nuevosSeleccionados = actual.filter((id) => id !== loteId)
      } else {
        nuevosSeleccionados = [...actual, loteId]
      }

      return {
        ...prev,
        [productoId]: {
          ...config,
          seleccionados: nuevosSeleccionados,
        },
      }
    })
  }

  // Verifica el estado de cobertura de cada producto
  const calcularEstadoProducto = (prod) => {
    const config = configuraciones[prod.productoId] || { modo: 'auto', seleccionados: [] }
    const requerido = prod.cantidadRequerida
    const totalDisponible = prod.lotes.reduce((sum, l) => sum + l.cantidad, 0)

    if (totalDisponible < requerido) {
      return {
        cubierto: false,
        error: 'Stock total insuficiente en lotes vigentes',
        detallesConsumo: [],
      }
    }

    if (config.modo === 'auto') {
      let rest = requerido
      const detalles = []
      for (const lote of prod.lotes) {
        if (rest <= 0) break
        const aConsumir = Math.min(rest, lote.cantidad)
        detalles.push({
          loteId: lote.id,
          cantidad: aConsumir,
          entero: aConsumir === lote.cantidad,
        })
        rest -= aConsumir
      }
      return {
        cubierto: rest <= 0,
        detallesConsumo: detalles,
      }
    }

    // Modo manual: acumular en el orden en que se seleccionaron
    let acumulado = 0
    let rest = requerido
    const detalles = []
    for (const loteId of config.seleccionados) {
      const loteObj = prod.lotes.find((l) => l.id === loteId)
      if (!loteObj) continue
      const aConsumir = Math.min(rest, loteObj.cantidad)
      acumulado += loteObj.cantidad
      detalles.push({
        loteId,
        cantidad: aConsumir,
        entero: aConsumir === loteObj.cantidad,
      })
      rest = Math.max(0, rest - aConsumir)
    }

    return {
      cubierto: acumulado >= requerido,
      acumulado,
      detallesConsumo: detalles,
    }
  }

  const estadosPorProducto = lotesPorProducto.map((p) => ({
    productoId: p.productoId,
    estado: calcularEstadoProducto(p),
  }))

  const todosCubiertos =
    estadosPorProducto.length > 0 && estadosPorProducto.every((ep) => ep.estado.cubierto)

  const handleConfirmar = () => {
    if (!todosCubiertos) return

    const asignaciones = lotesPorProducto.map((p) => {
      const config = configuraciones[p.productoId] || { modo: 'auto', seleccionados: [] }
      return {
        productoId: p.productoId,
        modo: config.modo,
        lotes: config.modo === 'manual' ? config.seleccionados : [],
      }
    })

    onConfirmar(pedido.id, asignaciones)
  }

  return (
    <Modal titulo="Aceptar Pedido y Asignar Lotes" onCerrar={onCerrar} tamanio="grande">
      <div className="form-confirmacion-accion" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <p className="mensaje-confirmacion">
          ¿Deseas aceptar el pedido del comercio <strong>{pedido.comercio || 'N/A'}</strong>?
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.95rem', color: 'var(--admin-texto-secundario, #555)' }}>
          Al aceptar este pedido, se consolidará y registrará automáticamente como <strong>venta</strong> por un monto total de{' '}
          <strong>{formatearPrecio(totalFinal)}</strong>.
        </p>

        <div style={{ marginTop: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Asignación de Lotes para Salida de Stock
          </h4>

          {cargandoLotes ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <Spinner texto="Cargando disponibilidad de lotes..." />
            </div>
          ) : errorLotes ? (
            <div className="orden-alerta orden-alerta-error" role="alert">
              {errorLotes}
            </div>
          ) : lotesPorProducto.length === 0 ? (
            <p style={{ color: 'var(--color-peligro, #ef4444)' }}>
              No se encontraron productos en el pedido para asignar lotes.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {lotesPorProducto.map((prod) => {
                const config = configuraciones[prod.productoId] || {
                  modo: 'auto',
                  seleccionados: [],
                }
                const estadoProd = calcularEstadoProducto(prod)

                return (
                  <div
                    key={prod.productoId}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <strong>{prod.nombre}</strong>
                        {prod.marca ? (
                          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}> · {prod.marca}</span>
                        ) : null}
                        <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.15rem' }}>
                          Cantidad requerida: <strong>{prod.cantidadRequerida} unidades</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`modo-${prod.productoId}`}
                            value="auto"
                            checked={config.modo === 'auto'}
                            onChange={() => cambiarModo(prod.productoId, 'auto')}
                          />
                          Automático (próximo a vencer)
                        </label>
                        <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', marginLeft: '0.5rem' }}>
                          <input
                            type="radio"
                            name={`modo-${prod.productoId}`}
                            value="manual"
                            checked={config.modo === 'manual'}
                            onChange={() => cambiarModo(prod.productoId, 'manual')}
                          />
                          Selección manual
                        </label>
                      </div>
                    </div>

                    {/* Lista de lotes */}
                    {prod.lotes.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-peligro, #ef4444)' }}>
                        No hay lotes activos y vigentes para este producto.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {prod.lotes.map((lote) => {
                          const detalleConsumo = estadoProd.detallesConsumo.find(
                            (d) => d.loteId === lote.id,
                          )
                          const estaSeleccionado = config.modo === 'auto'
                            ? Boolean(detalleConsumo)
                            : config.seleccionados.includes(lote.id)

                          return (
                            <div
                              key={lote.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                backgroundColor: estaSeleccionado ? '#f0fdf4' : '#f9fafb',
                                border: estaSeleccionado ? '1px solid #86efac' : '1px solid #e5e7eb',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {config.modo === 'manual' ? (
                                  <input
                                    type="checkbox"
                                    id={`lote-${lote.id}`}
                                    checked={estaSeleccionado}
                                    onChange={() =>
                                      toggleLoteSeleccionado(
                                        prod.productoId,
                                        lote.id,
                                        prod.cantidadRequerida,
                                        prod.lotes,
                                      )
                                    }
                                  />
                                ) : (
                                  <span style={{ width: '1rem', textAlign: 'center', color: '#16a34a' }}>
                                    {estaSeleccionado ? '✓' : '•'}
                                  </span>
                                )}
                                <label
                                  htmlFor={`lote-${lote.id}`}
                                  style={{ cursor: config.modo === 'manual' ? 'pointer' : 'default' }}
                                >
                                  <strong>Lote #{lote.id}</strong> · Vence:{' '}
                                  <strong>{formatearFecha(lote.fechaVencimiento)}</strong> · Disponible:{' '}
                                  <strong>{lote.cantidad} unidades</strong>
                                </label>
                              </div>

                              <div>
                                {detalleConsumo ? (
                                  <span
                                    style={{
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                      backgroundColor: detalleConsumo.entero ? '#dcfce7' : '#fef9c3',
                                      color: detalleConsumo.entero ? '#15803d' : '#854d0e',
                                    }}
                                  >
                                    {detalleConsumo.entero
                                      ? `Entero (${detalleConsumo.cantidad} u.)`
                                      : `Parcial (${detalleConsumo.cantidad} de ${lote.cantidad} u.)`}
                                  </span>
                                ) : (
                                  <span style={{ color: '#9ca3af' }}>No se consume</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Resumen de cobertura */}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      {config.modo === 'manual' && (
                        <div>
                          Cubierto:{' '}
                          <strong
                            style={{
                              color: estadoProd.cubierto ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {estadoProd.acumulado || 0} / {prod.cantidadRequerida} unidades
                          </strong>
                          {!estadoProd.cubierto && (
                            <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                              (Faltan {Math.max(0, prod.cantidadRequerida - (estadoProd.acumulado || 0))} u.)
                            </span>
                          )}
                        </div>
                      )}
                      {estadoProd.error && (
                        <p style={{ color: '#dc2626', marginTop: '0.25rem', fontWeight: 500 }}>
                          {estadoProd.error}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-acciones-footer" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            className="orden-btn orden-btn-primario"
            disabled={cargando || cargandoLotes || !todosCubiertos}
            onClick={handleConfirmar}
          >
            {cargando ? 'Procesando Venta...' : 'Confirmar y Crear Venta'}
          </button>
          <button
            type="button"
            className="orden-btn"
            onClick={onCerrar}
            disabled={cargando}
          >
            Volver
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ModalConfirmarAceptacion