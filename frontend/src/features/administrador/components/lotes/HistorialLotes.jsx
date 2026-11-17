import { Fragment, useMemo, useState } from 'react'
import { LuEye } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearFecha, formatearPrecio } from '../../../../shared/utils/formato'
import { diasHasta, hoyISO } from '../../utils/vencimientos'
import { obtenerHistorialLotes } from '../../services/lotesService'
import { useHistorial } from '../../hooks/useHistorial'
import FiltrosHistorial from '../comunes/FiltrosHistorial'
import PaginadorHistorial from '../comunes/PaginadorHistorial'
import DetalleLote from '../vencimientos/DetalleLote'

const POR_PAGINA = 25
const UMBRAL_POR_VENCER = 30

const ETIQUETA_SITUACION = {
  vigente: { texto: 'Vigente', clase: 'hist-badge-vigente' },
  agotado: { texto: 'Agotado (0)', clase: 'hist-badge-agotado' },
  vencido: { texto: 'Vencido', clase: 'hist-badge-vencido' },
  eliminado: { texto: 'Eliminado', clase: 'hist-badge-eliminado' },
}

function esPorVencer(lote, hoy) {
  if (lote.situacion !== 'vigente') return false
  const dias = diasHasta(lote.fechaVencimiento, hoy)
  return dias !== null && dias >= 0 && dias < UMBRAL_POR_VENCER
}

function HistorialLotes() {
  const { datos: lotes, cargando, error, recargar } = useHistorial(obtenerHistorialLotes)
  const [hoy] = useState(hoyISO)
  const [chip, setChip] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [orden, setOrden] = useState({ campo: 'id', dir: 'desc' })
  const [pagina, setPagina] = useState(1)
  const [detalleId, setDetalleId] = useState(null)

  const conteos = useMemo(() => {
    const res = { todos: lotes.length, conStock: 0, agotados: 0, vencidos: 0, porVencer: 0, eliminados: 0 }
    lotes.forEach((l) => {
      if (l.situacion === 'eliminado') res.eliminados += 1
      else if (l.situacion === 'agotado') res.agotados += 1
      else if (l.situacion === 'vencido') res.vencidos += 1
      if (l.activo !== false && Number(l.cantidad) > 0) res.conStock += 1
      if (esPorVencer(l, hoy)) res.porVencer += 1
    })
    return res
  }, [lotes, hoy])

  const chips = [
    { clave: 'todos', etiqueta: 'Todos', cantidad: conteos.todos },
    { clave: 'con-stock', etiqueta: 'Con stock', cantidad: conteos.conStock },
    { clave: 'agotados', etiqueta: 'Stock 0', cantidad: conteos.agotados },
    { clave: 'vencidos', etiqueta: 'Vencidos', cantidad: conteos.vencidos },
    { clave: 'por-vencer', etiqueta: 'Por vencer', cantidad: conteos.porVencer },
    { clave: 'eliminados', etiqueta: 'Eliminados', cantidad: conteos.eliminados },
  ]

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const lista = lotes.filter((l) => {
      if (chip === 'con-stock' && !(l.activo !== false && Number(l.cantidad) > 0)) return false
      if (chip === 'agotados' && l.situacion !== 'agotado') return false
      if (chip === 'vencidos' && l.situacion !== 'vencido') return false
      if (chip === 'por-vencer' && !esPorVencer(l, hoy)) return false
      if (chip === 'eliminados' && l.situacion !== 'eliminado') return false

      const venci = String(l.fechaVencimiento ?? '').slice(0, 10)
      if (desde && venci < desde) return false
      if (hasta && venci > hasta) return false

      if (q) {
        const texto = [
          l.producto?.nombre,
          l.producto?.marca,
          l.ordenCompra?.proveedor?.nombre,
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
      if (orden.campo === 'vencimiento') {
        return String(a.fechaVencimiento ?? '').localeCompare(String(b.fechaVencimiento ?? '')) * signo
      }
      if (orden.campo === 'cantidad') {
        return (Number(a.cantidad) - Number(b.cantidad)) * signo
      }
      return (Number(a.id) - Number(b.id)) * signo
    })
  }, [lotes, chip, busqueda, desde, hasta, orden, hoy])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const visibles = filtrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA)

  const alternarOrden = (campo) => {
    setOrden((prev) =>
      prev.campo === campo
        ? { campo, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { campo, dir: 'asc' },
    )
  }

  const limpiar = () => {
    setChip('todos')
    setBusqueda('')
    setDesde('')
    setHasta('')
    setPagina(1)
  }

  if (cargando) return <Spinner texto="Cargando historial de lotes..." />
  if (error) {
    return (
      <MensajeVacio titulo="No pudimos cargar el historial de lotes" texto={error.message}>
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
        placeholderBusqueda="Producto, marca o proveedor"
        conRangoFechas
        desde={desde}
        hasta={hasta}
        onDesdeChange={(v) => { setDesde(v); setPagina(1) }}
        onHastaChange={(v) => { setHasta(v); setPagina(1) }}
        totalVisibles={filtrados.length}
        totalRegistros={lotes.length}
        hayFiltrosActivos={chip !== 'todos' || busqueda !== '' || desde !== '' || hasta !== ''}
        onLimpiar={limpiar}
      />

      {filtrados.length === 0 ? (
        <MensajeVacio
          titulo="No hay lotes que coincidan"
          texto="Probá cambiando el filtro de estado o la búsqueda."
        />
      ) : (
        <section className="sec-prod-admin lotes-tabla-contenedor" aria-live="polite">
          <table className="tabla-prod-admin lotes-tabla">
            <thead>
              <tr>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('id')}>
                    Lote / Orden {orden.campo === 'id' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th className="lotes-col-numero">
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('cantidad')}>
                    Stock (Disp. / Inicial) {orden.campo === 'cantidad' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th className="lotes-col-numero">Total</th>
                <th>
                  <button type="button" className="hist-ordenar-btn" onClick={() => alternarOrden('vencimiento')}>
                    Vencimiento {orden.campo === 'vencimiento' ? (orden.dir === 'asc' ? '↑' : '↓') : '↕'}
                  </button>
                </th>
                <th>Estado</th>
                <th className="orden-col-acciones">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((lote, index) => {
                const numeroFila = (paginaSegura - 1) * POR_PAGINA + index + 1
                const badge = ETIQUETA_SITUACION[lote.situacion] || ETIQUETA_SITUACION.vigente
                const abierto = detalleId === lote.id
                const loteParaDetalle = {
                  ...lote,
                  dias: diasHasta(lote.fechaVencimiento, hoy),
                  estado: { etiqueta: badge.texto },
                }

                return (
                  <Fragment key={lote.id}>
                    <tr className={lote.eliminado ? 'hist-fila-eliminada' : ''}>
                      <td>
                        <div className="lotes-celda-doble">
                          <span className="lotes-codigo">#{numeroFila}</span>
                          <span className="lotes-subtexto">
                            {lote.ordenCompra?.fecha
                              ? `Orden: ${formatearFecha(lote.ordenCompra.fecha)}`
                              : lote.ordenCompra
                                ? 'Orden asociada'
                                : 'Sin orden'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="lotes-celda-doble">
                          <span className="lotes-principal">
                            {lote.producto?.nombre || 'Sin producto'}
                            {lote.producto?.activo === false && (
                              <span className="hist-item-eliminado-tag">Producto eliminado</span>
                            )}
                          </span>
                          {lote.producto?.marca && (
                            <span className="lotes-subtexto">{lote.producto.marca}</span>
                          )}
                        </div>
                      </td>
                      <td>{lote.ordenCompra?.proveedor?.nombre || 'Sin proveedor'}</td>
                      <td className="lotes-col-numero">
                        <strong>{lote.cantidad}</strong> / {lote.cantidadInicial ?? lote.cantidad}
                      </td>
                      <td className="lotes-col-numero">
                        {lote.total != null ? formatearPrecio(lote.total) : '—'}
                      </td>
                      <td>{formatearFecha(lote.fechaVencimiento)}</td>
                      <td>
                        <span className={`hist-badge ${badge.clase}`}>{badge.texto}</span>
                      </td>
                      <td className="orden-col-acciones">
                        <button
                          type="button"
                          className={`venc-btn-icono venc-btn-ver${abierto ? ' activo' : ''}`}
                          onClick={() => setDetalleId((prev) => (prev === lote.id ? null : lote.id))}
                          aria-expanded={abierto}
                          title={abierto ? 'Ocultar detalle' : 'Ver detalle'}
                        >
                          <LuEye size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>

                    {abierto && (
                      <tr className="venc-fila-detalle">
                        <td colSpan={8}>
                          <DetalleLote lote={loteParaDetalle} numeroLote={numeroFila} />
                          <div className="hist-salidas-bloque">
                            <h4 className="hist-salidas-titulo">Salidas registradas del lote</h4>
                            {!lote.salidas || lote.salidas.length === 0 ? (
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                                Este lote aún no registra salidas en ventas.
                              </p>
                            ) : (
                              <ul className="hist-salidas-lista">
                                {lote.salidas.map((s, idx) => (
                                  <li key={`${s.pedidoId}-${idx}`} className="hist-salidas-item">
                                    <span><strong>Salida #{idx + 1}</strong></span>
                                    <span>· {s.comercio || 'Sin comercio'}</span>
                                    <span>· {formatearFecha(s.fecha)}</span>
                                    <span>· <strong>{s.cantidad} u.</strong>{s.consumidoEntero ? ' (consumo entero)' : ''}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
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

export default HistorialLotes
