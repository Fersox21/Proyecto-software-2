import { Fragment, useMemo, useState } from 'react'
import { LuEye } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { obtenerClaseEstadoChip } from '../../utils/estadoPedido'
import { obtenerHistorialPedidos, obtenerPedidoPorId } from '../../services/pedidosService'
import { useHistorial } from '../../hooks/useHistorial'
import FiltrosHistorial from '../comunes/FiltrosHistorial'
import PaginadorHistorial from '../comunes/PaginadorHistorial'
import DetallePedidoInfo from './DetallePedidoInfo'
import DetallePedidoItems from './DetallePedidoItems'

const POR_PAGINA = 25

function categoriaEstado(pedido) {
  const est = String(pedido.estado ?? '').trim().toLowerCase()
  if (pedido.eliminado || pedido.activo === false || est === 'eliminado') return 'eliminado'
  if (['pendiente', 'nuevo', 'en_proceso'].includes(est)) return 'pendiente'
  if (['aprobado', 'aceptado', 'completado', 'entregado', 'confirmado'].includes(est)) return 'aprobado'
  if (['rechazado', 'cancelado', 'anulado'].includes(est)) return 'rechazado'
  return 'otro'
}

function HistorialPedidos() {
  const { datos: pedidos, cargando, error, recargar } = useHistorial(obtenerHistorialPedidos)
  const [chip, setChip] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [orden, setOrden] = useState({ campo: 'fecha', dir: 'desc' })
  const [pagina, setPagina] = useState(1)

  const [abiertoId, setAbiertoId] = useState(null)
  const [detallesPorId, setDetallesPorId] = useState({})
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null)
  const [errorDetalle, setErrorDetalle] = useState('')

  const conteos = useMemo(() => {
    const res = { todos: pedidos.length, pendiente: 0, aprobado: 0, rechazado: 0, eliminado: 0 }
    pedidos.forEach((p) => {
      const cat = categoriaEstado(p)
      if (res[cat] != null) res[cat] += 1
    })
    return res
  }, [pedidos])

  const chips = [
    { clave: 'todos', etiqueta: 'Todos', cantidad: conteos.todos },
    { clave: 'pendiente', etiqueta: 'Pendientes', cantidad: conteos.pendiente },
    { clave: 'aprobado', etiqueta: 'Aprobados', cantidad: conteos.aprobado },
    { clave: 'rechazado', etiqueta: 'Rechazados', cantidad: conteos.rechazado },
    { clave: 'eliminado', etiqueta: 'Eliminados', cantidad: conteos.eliminado },
  ]

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = pedidos.filter((p) => {
      if (chip !== 'todos' && categoriaEstado(p) !== chip) return false

      const fechaStr = String(p.fecha ?? '').slice(0, 10)
      if (desde && fechaStr < desde) return false
      if (hasta && fechaStr > hasta) return false

      if (q) {
        const texto = [
          p.comercio,
          p.personaContacto,
          p.telefono,
          p.estado,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!texto.includes(q)) return false
      }
      return true
    })

    const signo = orden.dir === 'asc' ? 1 : -1
    return [...lista].sort((a, b) => {
      if (orden.campo === 'total') {
        const ta = Number(a.totalModificado ?? a.total ?? 0)
        const tb = Number(b.totalModificado ?? b.total ?? 0)
        return (ta - tb) * signo
      }
      const cmpFecha = String(a.fecha ?? '').localeCompare(String(b.fecha ?? ''))
      if (cmpFecha !== 0) return cmpFecha * signo
      return (Number(a.id) - Number(b.id)) * signo
    })
  }, [pedidos, chip, busqueda, desde, hasta, orden])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA)

  const alternarOrden = (campo) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'desc' },
    )
  }

  const alternarDetalle = async (pedido) => {
    if (abiertoId === pedido.id) {
      setAbiertoId(null)
      return
    }
    setAbiertoId(pedido.id)
    setErrorDetalle('')
    if (detallesPorId[pedido.id]) return

    setCargandoDetalleId(pedido.id)
    try {
      const detalle = await obtenerPedidoPorId(pedido.id, { historial: true })
      setDetallesPorId((prev) => ({ ...prev, [pedido.id]: detalle }))
    } catch (err) {
      setErrorDetalle(err.message || 'No se pudo cargar el detalle del pedido.')
    } finally {
      setCargandoDetalleId(null)
    }
  }

  const limpiar = () => {
    setChip('todos')
    setBusqueda('')
    setDesde('')
    setHasta('')
    setPagina(1)
  }

  if (cargando) return <Spinner texto="Cargando historial de pedidos..." />
  if (error) {
    return (
      <MensajeVacio titulo="No pudimos cargar el historial de pedidos" texto={error.message}>
        <button type="button" className="orden-btn orden-btn-primario" onClick={recargar}>
          Reintentar
        </button>
      </MensajeVacio>
    )
  }

  return (
    <div>
      <FiltrosHistorial
        chips={chips}
        chipActivo={chip}
        onChipChange={(c) => { setChip(c); setPagina(1) }}
        busqueda={busqueda}
        onBusquedaChange={(v) => { setBusqueda(v); setPagina(1) }}
        placeholderBusqueda="Comercio, contacto o teléfono"
        conRangoFechas
        desde={desde}
        hasta={hasta}
        onDesdeChange={(v) => { setDesde(v); setPagina(1) }}
        onHastaChange={(v) => { setHasta(v); setPagina(1) }}
        totalVisibles={filtrados.length}
        totalRegistros={pedidos.length}
        hayFiltrosActivos={chip !== 'todos' || busqueda !== '' || desde !== '' || hasta !== ''}
        onLimpiar={limpiar}
      />

      {filtrados.length === 0 ? (
        <MensajeVacio
          titulo="No hay pedidos que coincidan"
          texto="Probá con otro estado, búsqueda o rango de fechas."
        />
      ) : (
        <section className="sec-prod-admin" aria-live="polite">
          <table className="tabla-prod-admin">
            <thead>
              <tr>
                <th>Pedido / Comercio</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('fecha')}>
                    Fecha {orden.campo === 'fecha' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Entrega / Pago</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('total')}>
                    Total {orden.campo === 'total' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Estado</th>
                <th className="col-acciones-header">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((pedido, index) => {
                const numeroFila = (paginaSegura - 1) * POR_PAGINA + index + 1
                const abierto = abiertoId === pedido.id
                const cat = categoriaEstado(pedido)
                const esEliminado = cat === 'eliminado'
                const detalle = detallesPorId[pedido.id]
                const totalFinal = pedido.totalModificado ?? pedido.total ?? 0

                return (
                  <Fragment key={pedido.id}>
                    <tr className={esEliminado ? 'hist-fila-eliminada' : ''}>
                      <td>
                        <div className="lotes-celda-doble">
                          <span className="lotes-principal">
                            #{numeroFila} · {pedido.comercio || 'Sin comercio'}
                          </span>
                          {pedido.personaContacto && (
                            <span className="lotes-subtexto">{pedido.personaContacto}</span>
                          )}
                        </div>
                      </td>
                      <td>{formatearFecha(pedido.fecha)}</td>
                      <td>
                        <div className="lotes-celda-doble">
                          <span>{pedido.modalidadEntrega || '—'}</span>
                          <span className="lotes-subtexto">{pedido.metodoPago || '—'}</span>
                        </div>
                      </td>
                      <td>{formatearPrecio(totalFinal)}</td>
                      <td>
                        {esEliminado ? (
                          <span className="hist-badge hist-badge-eliminado">Eliminado</span>
                        ) : (
                          <span className={`pedido-estado-chip ${obtenerClaseEstadoChip(pedido.estado)}`}>
                            {pedido.estado}
                          </span>
                        )}
                      </td>
                      <td className="orden-col-acciones">
                        <button
                          type="button"
                          className={`venc-btn-icono venc-btn-ver${abierto ? ' activo' : ''}`}
                          onClick={() => alternarDetalle(pedido)}
                          aria-expanded={abierto}
                          title={abierto ? 'Ocultar detalle' : 'Ver detalle'}
                        >
                          <LuEye size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>

                    {abierto && (
                      <tr className="venc-fila-detalle">
                        <td colSpan={6}>
                          {cargandoDetalleId === pedido.id ? (
                            <div style={{ padding: '1rem', textAlign: 'center' }}>
                              <Spinner texto="Cargando detalle del pedido..." />
                            </div>
                          ) : errorDetalle && !detalle ? (
                            <p style={{ color: '#dc2626', margin: '0.5rem 0' }}>{errorDetalle}</p>
                          ) : detalle ? (
                            <div className="detalle-pedido-modal-contenido">
                              <DetallePedidoInfo pedido={detalle} />
                              <DetallePedidoItems
                                items={detalle.items || []}
                                total={detalle.total || 0}
                              />
                              {detalle.totalModificado != null && (
                                <div className="detalle-campo detalle-campo-alerta">
                                  <span className="detalle-valor">
                                    Total: {formatearPrecio(detalle.total || 0)} (Modificado a:{' '}
                                    {formatearPrecio(detalle.totalModificado)})
                                  </span>
                                  {detalle.motivoModificacion && (
                                    <span className="detalle-etiqueta motivo-texto">
                                      Motivo: {detalle.motivoModificacion}
                                    </span>
                                  )}
                                </div>
                              )}
                              {detalle.motivoRechazo && (
                                <div className="detalle-campo detalle-campo-alerta">
                                  <span className="detalle-etiqueta motivo-texto">
                                    Motivo de rechazo: {detalle.motivoRechazo}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>

          <PaginadorHistorial
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalRegistros={filtrados.length}
            porPagina={POR_PAGINA}
            onCambiarPagina={setPagina}
          />
        </section>
      )}
    </div>
  )
}

export default HistorialPedidos
