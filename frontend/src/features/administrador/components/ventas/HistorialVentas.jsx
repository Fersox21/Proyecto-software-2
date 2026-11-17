import { useMemo, useState } from 'react'
import { LuEye } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { obtenerHistorialVentas, obtenerVentaPorId, obtenerProductosVenta } from '../../services/ventasService'
import { obtenerPedidoPorId } from '../../services/pedidosService'
import { useHistorial } from '../../hooks/useHistorial'
import FiltrosHistorial from '../comunes/FiltrosHistorial'
import PaginadorHistorial from '../comunes/PaginadorHistorial'
import DetalleVentaModal from './DetalleVentaModal'

const POR_PAGINA = 25

function HistorialVentas() {
  const { datos: ventas, cargando, error, recargar } = useHistorial(obtenerHistorialVentas)
  const [chip, setChip] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [orden, setOrden] = useState({ campo: 'fecha', dir: 'desc' })
  const [pagina, setPagina] = useState(1)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [ventaDetalle, setVentaDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState('')

  const conteos = useMemo(() => {
    const res = { todas: ventas.length, vigentes: 0, eliminadas: 0, conAjuste: 0 }
    ventas.forEach((v) => {
      if (v.eliminada || v.activo === false) res.eliminadas += 1
      else res.vigentes += 1
      if ((v.totalModificado ?? v.total_modificado) != null) res.conAjuste += 1
    })
    return res
  }, [ventas])

  const chips = [
    { clave: 'todas', etiqueta: 'Todas', cantidad: conteos.todas },
    { clave: 'vigentes', etiqueta: 'Vigentes', cantidad: conteos.vigentes },
    { clave: 'eliminadas', etiqueta: 'Eliminadas', cantidad: conteos.eliminadas },
    { clave: 'con-ajuste', etiqueta: 'Con ajuste de precio', cantidad: conteos.conAjuste },
  ]

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = ventas.filter((v) => {
      const esEliminada = Boolean(v.eliminada || v.activo === false)
      const tieneAjuste = (v.totalModificado ?? v.total_modificado) != null

      if (chip === 'vigentes' && esEliminada) return false
      if (chip === 'eliminadas' && !esEliminada) return false
      if (chip === 'con-ajuste' && !tieneAjuste) return false

      const fechaStr = String(v.fecha ?? '').slice(0, 10)
      if (desde && fechaStr < desde) return false
      if (hasta && fechaStr > hasta) return false

      if (q) {
        const texto = [
          v.comercio,
          v.motivoModificacion ?? v.motivo_modificacion,
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
        const ta = Number(a.totalModificado ?? a.total_modificado ?? a.total ?? 0)
        const tb = Number(b.totalModificado ?? b.total_modificado ?? b.total ?? 0)
        return (ta - tb) * signo
      }
      const cmpFecha = String(a.fecha ?? '').localeCompare(String(b.fecha ?? ''))
      if (cmpFecha !== 0) return cmpFecha * signo
      return (Number(a.id) - Number(b.id)) * signo
    })
  }, [ventas, chip, busqueda, desde, hasta, orden])

  const totalAcumulado = useMemo(
    () =>
      filtradas.reduce(
        (acc, v) => acc + Number(v.totalModificado ?? v.total_modificado ?? v.total ?? 0),
        0,
      ),
    [filtradas],
  )

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA)

  const alternarOrden = (campo) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'desc' },
    )
  }

  const verDetalle = async (ventaId) => {
    setModalAbierto(true)
    setCargandoDetalle(true)
    setErrorDetalle('')
    setVentaDetalle(null)
    try {
      const detalle = await obtenerVentaPorId(ventaId, { historial: true })
      let pedido = detalle?.pedido || null
      let items = detalle?.items || detalle?.productos || pedido?.items || null
      const pedidoId = detalle?.pedido_id ?? detalle?.pedidoId
      if (!pedido && pedidoId) {
        try {
          pedido = await obtenerPedidoPorId(pedidoId, { historial: true })
          if (!items) items = pedido?.items || null
        } catch {
          // continúa con los datos disponibles
        }
      }
      if (!items) {
        try {
          items = await obtenerProductosVenta(ventaId, { historial: true })
        } catch {
          items = []
        }
      }
      setVentaDetalle({
        ...detalle,
        pedido: pedido || detalle?.pedido || {},
        items: Array.isArray(items) ? items : [],
      })
    } catch (err) {
      setErrorDetalle(err.message || 'No se pudo cargar el detalle de la venta.')
    } finally {
      setCargandoDetalle(false)
    }
  }

  const limpiar = () => {
    setChip('todas')
    setBusqueda('')
    setDesde('')
    setHasta('')
    setPagina(1)
  }

  if (cargando) return <Spinner texto="Cargando historial de ventas..." />
  if (error) {
    return (
      <MensajeVacio titulo="No pudimos cargar el historial de ventas" texto={error.message}>
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
        placeholderBusqueda="Comercio o motivo de ajuste"
        conRangoFechas
        desde={desde}
        hasta={hasta}
        onDesdeChange={(v) => { setDesde(v); setPagina(1) }}
        onHastaChange={(v) => { setHasta(v); setPagina(1) }}
        totalVisibles={filtradas.length}
        totalRegistros={ventas.length}
        hayFiltrosActivos={chip !== 'todas' || busqueda !== '' || desde !== '' || hasta !== ''}
        onLimpiar={limpiar}
      />

      {filtradas.length === 0 ? (
        <MensajeVacio
          titulo="No hay ventas que coincidan"
          texto="Probá con otro filtro o rango de fechas."
        />
      ) : (
        <section className="sec-tabla-admin sec-tabla-ventas" aria-live="polite">
          <table className="tabla-admin tabla-ventas">
            <thead>
              <tr>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('fecha')}>
                    Venta y Fecha {orden.campo === 'fecha' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Comercio</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('total')}>
                    Total {orden.campo === 'total' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Estado</th>
                <th className="col-acciones">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((venta, index) => {
                const numeroFila = (paginaSegura - 1) * POR_PAGINA + index + 1
                const totalMod = venta.totalModificado ?? venta.total_modificado
                const motivoMod = venta.motivoModificacion ?? venta.motivo_modificacion
                const totalOriginal = venta.total ?? 0
                const tieneAjuste = totalMod != null
                const precioFinal = tieneAjuste ? totalMod : totalOriginal
                const esEliminada = Boolean(venta.eliminada || venta.activo === false)

                return (
                  <tr key={venta.id} className={esEliminada ? 'hist-fila-eliminada' : ''}>
                    <td className="col-admin">
                      <div className="venta-id-fecha">
                        <span className="venta-id">#{numeroFila}</span>
                        <span className="venta-fecha">
                          {venta.fecha ? formatearFecha(venta.fecha) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="col-admin">{venta.comercio || '—'}</td>
                    <td className="col-admin col-monto">
                      <div className="venta-total-bloque">
                        <div className="venta-total-linea">
                          <span className="venta-total-final">{formatearPrecio(precioFinal)}</span>
                          {tieneAjuste && (
                            <span className="venta-total-original">{formatearPrecio(totalOriginal)}</span>
                          )}
                        </div>
                        {motivoMod && <div className="venta-total-motivo">{motivoMod}</div>}
                      </div>
                    </td>
                    <td className="col-admin">
                      {esEliminada ? (
                        <span className="hist-badge hist-badge-eliminado">Eliminado</span>
                      ) : (
                        <span className="hist-badge hist-badge-vigente">Vigente</span>
                      )}
                    </td>
                    <td className="col-admin col-acciones">
                      <button
                        type="button"
                        className="venta-btn-icono venta-btn-ver"
                        title="Ver detalle"
                        aria-label={`Ver detalle de venta #${numeroFila}`}
                        onClick={() => verDetalle(venta.id)}
                      >
                        <LuEye size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="hist-resumen-pie">
            <span>Total acumulado (filtradas): {formatearPrecio(totalAcumulado)}</span>
          </div>

          <PaginadorHistorial
            paginaActual={paginaSegura}
            totalPaginas={totalPaginas}
            totalRegistros={filtradas.length}
            porPagina={POR_PAGINA}
            onCambiarPagina={setPagina}
          />
        </section>
      )}

      {modalAbierto && (
        <DetalleVentaModal
          venta={ventaDetalle}
          cargando={cargandoDetalle}
          error={errorDetalle}
          onCerrar={() => {
            setModalAbierto(false)
            setVentaDetalle(null)
            setErrorDetalle('')
          }}
        />
      )}
    </div>
  )
}

export default HistorialVentas
