import { Fragment, useMemo, useState } from 'react'
import { LuPackage } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import {
  obtenerHistorialOrdenesCompra,
  obtenerOrdenCompraPorId,
} from '../../services/ordenesCompraService'
import { useHistorial } from '../../hooks/useHistorial'
import FiltrosHistorial from '../comunes/FiltrosHistorial'
import PaginadorHistorial from '../comunes/PaginadorHistorial'
import DetalleOrdenLotes from './DetalleOrdenLotes'

const POR_PAGINA = 25

function HistorialOrdenesCompra({ productosPorId = {} }) {
  const { datos: ordenes, cargando, error, recargar } = useHistorial(obtenerHistorialOrdenesCompra)
  const [chip, setChip] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [orden, setOrden] = useState({ campo: 'fecha', dir: 'desc' })
  const [pagina, setPagina] = useState(1)

  const [abiertaId, setAbiertaId] = useState(null)
  const [detallesPorId, setDetallesPorId] = useState({})
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null)
  const [errorDetalle, setErrorDetalle] = useState('')

  const conteos = useMemo(() => {
    const res = { todas: ordenes.length, activas: 0, eliminadas: 0 }
    ordenes.forEach((o) => {
      if (o.eliminada || o.activo === false) res.eliminadas += 1
      else res.activas += 1
    })
    return res
  }, [ordenes])

  const chips = [
    { clave: 'todas', etiqueta: 'Todas', cantidad: conteos.todas },
    { clave: 'activas', etiqueta: 'Activas', cantidad: conteos.activas },
    { clave: 'eliminadas', etiqueta: 'Eliminadas', cantidad: conteos.eliminadas },
  ]

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = ordenes.filter((o) => {
      const esEliminada = Boolean(o.eliminada || o.activo === false)
      if (chip === 'activas' && esEliminada) return false
      if (chip === 'eliminadas' && !esEliminada) return false

      const fechaStr = String(o.fecha ?? '').slice(0, 10)
      if (desde && fechaStr < desde) return false
      if (hasta && fechaStr > hasta) return false

      if (q) {
        const texto = [
          `#${o.id}`,
          o.proveedor?.nombre,
          o.proveedor?.telefono,
          formatearFecha(o.fecha),
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
        return (Number(a.total ?? 0) - Number(b.total ?? 0)) * signo
      }
      const cmpFecha = String(a.fecha ?? '').localeCompare(String(b.fecha ?? ''))
      if (cmpFecha !== 0) return cmpFecha * signo
      return (Number(a.id) - Number(b.id)) * signo
    })
  }, [ordenes, chip, busqueda, desde, hasta, orden])

  const totalAcumulado = useMemo(
    () => filtradas.reduce((acc, o) => acc + Number(o.total ?? 0), 0),
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

  const alternarDetalle = async (oc) => {
    if (abiertaId === oc.id) {
      setAbiertaId(null)
      return
    }
    setAbiertaId(oc.id)
    setErrorDetalle('')
    if (detallesPorId[oc.id]) return

    setCargandoDetalleId(oc.id)
    try {
      const detalle = await obtenerOrdenCompraPorId(oc.id, { historial: true })
      setDetallesPorId((prev) => ({ ...prev, [oc.id]: detalle }))
    } catch (err) {
      setErrorDetalle(err.message || 'No se pudieron cargar los lotes de la orden.')
    } finally {
      setCargandoDetalleId(null)
    }
  }

  const limpiar = () => {
    setChip('todas')
    setBusqueda('')
    setDesde('')
    setHasta('')
    setPagina(1)
  }

  if (cargando) return <Spinner texto="Cargando historial de órdenes de compra..." />
  if (error) {
    return (
      <MensajeVacio titulo="No pudimos cargar el historial de órdenes" texto={error.message}>
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
        placeholderBusqueda="#orden, proveedor o fecha"
        conRangoFechas
        desde={desde}
        hasta={hasta}
        onDesdeChange={(v) => { setDesde(v); setPagina(1) }}
        onHastaChange={(v) => { setHasta(v); setPagina(1) }}
        totalVisibles={filtradas.length}
        totalRegistros={ordenes.length}
        hayFiltrosActivos={chip !== 'todas' || busqueda !== '' || desde !== '' || hasta !== ''}
        onLimpiar={limpiar}
      />

      {filtradas.length === 0 ? (
        <MensajeVacio
          titulo="No hay órdenes que coincidan"
          texto="Probá con otro filtro o rango de fechas."
        />
      ) : (
        <section
          className="sec-prod-admin orden-tabla-contenedor dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          aria-live="polite"
        >
          <table className="tabla-prod-admin orden-tabla">
            <thead>
              <tr>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('fecha')}>
                    Orden y Fecha {orden.campo === 'fecha' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Proveedor</th>
                <th>Lotes</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('total')}>
                    Total {orden.campo === 'total' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Estado</th>
                <th className="orden-col-acciones">Lotes</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((oc) => {
                const abierta = abiertaId === oc.id
                const esEliminada = Boolean(oc.eliminada || oc.activo === false)
                const detalleOrden = detallesPorId[oc.id]

                return (
                  <Fragment key={oc.id}>
                    <tr className={esEliminada ? 'hist-fila-eliminada' : ''}>
                      <td className="orden-col-orden">
                        <div className="orden-id-fecha">
                          <span className="orden-id">#{oc.id}</span>
                          <span className="orden-fecha">{formatearFecha(oc.fecha)}</span>
                        </div>
                      </td>
                      <td className="orden-col-proveedor">
                        {oc.proveedor?.nombre || 'Sin proveedor'}
                      </td>
                      <td>{oc.cantidadLotes ?? 0}</td>
                      <td className="orden-col-monto">{formatearPrecio(oc.total ?? 0)}</td>
                      <td>
                        {esEliminada ? (
                          <span className="hist-badge hist-badge-eliminado">Eliminado</span>
                        ) : (
                          <span className="hist-badge hist-badge-vigente">Activa</span>
                        )}
                      </td>
                      <td className="orden-col-acciones">
                        <button
                          type="button"
                          className={`orden-btn-icono orden-btn-lotes${abierta ? ' activo' : ''}`}
                          onClick={() => alternarDetalle(oc)}
                          aria-expanded={abierta}
                          title={abierta ? 'Ocultar lotes' : 'Ver lotes'}
                        >
                          <LuPackage size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>

                    {abierta && (
                      <tr className="orden-fila-detalle">
                        <td colSpan={6}>
                          <DetalleOrdenLotes
                            detalle={{
                              cargando: cargandoDetalleId === oc.id,
                              error: !detalleOrden ? errorDetalle : '',
                              orden: detalleOrden,
                            }}
                            productosPorId={productosPorId}
                            ordenId={oc.id}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
    </div>
  )
}

export default HistorialOrdenesCompra
