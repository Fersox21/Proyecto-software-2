import { Fragment, useCallback, useMemo, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { formatearFecha } from '../../../shared/utils/formato'
import { useVencimientos } from '../hooks/useVencimientos'
import {
  DIAS_AVISO_POR_DEFECTO,
  UMBRALES_AVISO,
  compararPorProveedor,
  compararPorVencimiento,
  diasHasta,
  estadoVencimiento,
  hoyISO,
  nombreProducto,
  nombreProveedor,
  soloFecha,
  textoDias,
} from '../utils/vencimientos'
import EditarVencimientoForm from '../components/EditarVencimientoForm'
import DetalleLote from '../components/DetalleLote'
import Modal from '../components/Modal'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/vencimientos.css'

const TODOS = 'todos'

const ESTADOS = [
  { valor: 'vencido', etiqueta: 'Vencidos' },
  { valor: 'proximo', etiqueta: 'Próximos a vencer' },
  { valor: 'en-regla', etiqueta: 'En regla' },
]

function VencimientosPage() {
  const { lotes, cargando, error, recargar, cambiarVencimiento } = useVencimientos()

  const [hoy] = useState(hoyISO)
  const [umbral, setUmbral] = useState(DIAS_AVISO_POR_DEFECTO)
  const [busqueda, setBusqueda] = useState('')
  const [proveedorId, setProveedorId] = useState(TODOS)
  const [estado, setEstado] = useState(TODOS)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [orden, setOrden] = useState({ campo: 'fecha', direccion: 'asc' })

  const [detalleId, setDetalleId] = useState(null)
  const [loteAEditar, setLoteAEditar] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const filas = useMemo(
    () =>
      lotes.map((lote) => ({
        ...lote,
        dias: diasHasta(lote.fechaVencimiento, hoy),
        estado: estadoVencimiento(lote.fechaVencimiento, hoy, umbral),
        productoNombre: nombreProducto(lote),
        proveedorNombre: nombreProveedor(lote),
        proveedorId: lote.ordenCompra?.proveedor?.id ?? null,
      })),
    [lotes, hoy, umbral],
  )

  const proveedores = useMemo(() => {
    const mapa = new Map()

    filas.forEach((fila) => {
      if (fila.proveedorId != null) {
        mapa.set(String(fila.proveedorId), fila.proveedorNombre)
      }
    })

    return Array.from(mapa, ([valor, etiqueta]) => ({ valor, etiqueta })).sort((a, b) =>
      a.etiqueta.localeCompare(b.etiqueta, 'es'),
    )
  }, [filas])

  const resumen = useMemo(() => {
    const conteo = { vencido: 0, proximo: 0, 'en-regla': 0 }

    filas.forEach((fila) => {
      if (conteo[fila.estado.clave] != null) conteo[fila.estado.clave] += 1
    })

    return conteo
  }, [filas])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    const filtradas = filas.filter((fila) => {
      if (texto) {
        const contenido = [
          fila.productoNombre,
          fila.proveedorNombre,
          fila.producto?.marca,
          `#${fila.id}`,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!contenido.includes(texto)) return false
      }

      if (proveedorId !== TODOS && String(fila.proveedorId) !== proveedorId) return false
      if (estado !== TODOS && fila.estado.clave !== estado) return false

      const vencimiento = soloFecha(fila.fechaVencimiento)
      if (desde && vencimiento < desde) return false
      if (hasta && vencimiento > hasta) return false

      return true
    })

    const comparar = orden.campo === 'proveedor' ? compararPorProveedor : compararPorVencimiento
    const signo = orden.direccion === 'desc' ? -1 : 1

    return filtradas.sort((a, b) => comparar(a, b) * signo)
  }, [filas, busqueda, proveedorId, estado, desde, hasta, orden])

  const limpiarFiltros = useCallback(() => {
    setBusqueda('')
    setProveedorId(TODOS)
    setEstado(TODOS)
    setDesde('')
    setHasta('')
  }, [])

  const alternarOrden = useCallback((campo) => {
    setOrden((previo) =>
      previo.campo === campo
        ? { campo, direccion: previo.direccion === 'asc' ? 'desc' : 'asc' }
        : { campo, direccion: 'asc' },
    )
  }, [])

  const ariaSort = useCallback(
    (campo) => {
      if (orden.campo !== campo) return 'none'
      return orden.direccion === 'asc' ? 'ascending' : 'descending'
    },
    [orden],
  )

  const guardar = useCallback(
    async (fecha) => {
      const id = loteAEditar?.id
      await cambiarVencimiento(id, fecha)
      setLoteAEditar(null)
      setMensaje({ tipo: 'exito', texto: `Vencimiento del lote #${id} actualizado.` })
    },
    [loteAEditar, cambiarVencimiento],
  )

  const abrirEdicion = useCallback((fila) => {
    setMensaje(null)
    setLoteAEditar(fila)
  }, [])

  const alternarDetalle = useCallback((id) => {
    setDetalleId((previo) => (previo === id ? null : id))
  }, [])

  const hayFiltrosActivos =
    busqueda !== '' ||
    proveedorId !== TODOS ||
    estado !== TODOS ||
    desde !== '' ||
    hasta !== '' ||
    umbral !== DIAS_AVISO_POR_DEFECTO

  return (
    <section className="main-admin" id="main-vencimientos">
      <header className="header-admin">
        <h1 className="h1-admin">Vencimientos</h1>
        <button type="button" className="orden-btn" onClick={recargar} disabled={cargando}>
          Actualizar
        </button>
      </header>

      {mensaje && (
        <div
          className={`orden-alerta ${mensaje.tipo === 'error' ? 'orden-alerta-error' : 'orden-alerta-exito'}`}
          role="alert"
        >
          <span>{mensaje.texto}</span>
          <button
            type="button"
            className="orden-alerta-cerrar"
            onClick={() => setMensaje(null)}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}

      {cargando && <Spinner texto="Cargando vencimientos..." />}

      {!cargando && error && (
        <MensajeVacio titulo="No pudimos cargar los vencimientos" texto={error.message}>
          <button type="button" className="orden-btn orden-btn-primario" onClick={recargar}>
            Reintentar
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && lotes.length === 0 && (
        <MensajeVacio
          titulo="Todavía no hay lotes registrados"
          texto="Los lotes se crean desde Órdenes de compra. Cuando registres el primero, va a aparecer acá."
        />
      )}

      {!cargando && !error && lotes.length > 0 && (
        <>
          <section className="venc-resumen" aria-label="Resumen de vencimientos">
            <button
              type="button"
              className={`venc-tarjeta venc-tarjeta-vencido ${estado === 'vencido' ? 'activa' : ''}`}
              onClick={() => setEstado(estado === 'vencido' ? TODOS : 'vencido')}
              aria-pressed={estado === 'vencido'}
            >
              <span className="venc-tarjeta-valor">{resumen.vencido}</span>
              <span className="venc-tarjeta-etiqueta">Vencidos</span>
            </button>

            <button
              type="button"
              className={`venc-tarjeta venc-tarjeta-proximo ${estado === 'proximo' ? 'activa' : ''}`}
              onClick={() => setEstado(estado === 'proximo' ? TODOS : 'proximo')}
              aria-pressed={estado === 'proximo'}
            >
              <span className="venc-tarjeta-valor">{resumen.proximo}</span>
              <span className="venc-tarjeta-etiqueta">Próximos ({umbral} días)</span>
            </button>

            <button
              type="button"
              className={`venc-tarjeta venc-tarjeta-ok ${estado === 'en-regla' ? 'activa' : ''}`}
              onClick={() => setEstado(estado === 'en-regla' ? TODOS : 'en-regla')}
              aria-pressed={estado === 'en-regla'}
            >
              <span className="venc-tarjeta-valor">{resumen['en-regla']}</span>
              <span className="venc-tarjeta-etiqueta">En regla</span>
            </button>

            <div className="venc-tarjeta venc-tarjeta-total">
              <span className="venc-tarjeta-valor">{filas.length}</span>
              <span className="venc-tarjeta-etiqueta">Lotes totales</span>
            </div>
          </section>

          <section className="venc-filtros" aria-label="Filtros de vencimientos">
            <div className="orden-campo venc-campo-busqueda">
              <label htmlFor="venc-busqueda">Buscar</label>
              <input
                id="venc-busqueda"
                type="search"
                placeholder="Producto, proveedor o código"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            <div className="orden-campo">
              <label htmlFor="venc-proveedor">Proveedor</label>
              <select
                id="venc-proveedor"
                value={proveedorId}
                onChange={(evento) => setProveedorId(evento.target.value)}
              >
                <option value={TODOS}>Todos</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.valor} value={proveedor.valor}>
                    {proveedor.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div className="orden-campo">
              <label htmlFor="venc-estado">Estado</label>
              <select
                id="venc-estado"
                value={estado}
                onChange={(evento) => setEstado(evento.target.value)}
              >
                <option value={TODOS}>Todos</option>
                {ESTADOS.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div className="orden-campo">
              <label htmlFor="venc-desde">Vence desde</label>
              <input
                id="venc-desde"
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(evento) => setDesde(evento.target.value)}
              />
            </div>

            <div className="orden-campo">
              <label htmlFor="venc-hasta">Vence hasta</label>
              <input
                id="venc-hasta"
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(evento) => setHasta(evento.target.value)}
              />
            </div>

            <div className="orden-campo">
              <label htmlFor="venc-umbral">Aviso de próximos</label>
              <select
                id="venc-umbral"
                value={umbral}
                onChange={(evento) => setUmbral(Number(evento.target.value))}
              >
                {UMBRALES_AVISO.map((dias) => (
                  <option key={dias} value={dias}>
                    {dias} días
                  </option>
                ))}
              </select>
            </div>

            <div className="venc-filtros-pie">
              <span className="venc-conteo">
                Mostrando {visibles.length} de {filas.length} lotes
              </span>
              <button
                type="button"
                className="orden-btn orden-btn-chico"
                onClick={limpiarFiltros}
                disabled={!hayFiltrosActivos}
              >
                Limpiar filtros
              </button>
            </div>
          </section>

          {visibles.length === 0 ? (
            <MensajeVacio
              titulo="No hay lotes que coincidan"
              texto="Probá con otro proveedor, otro estado o un rango de fechas más amplio."
            >
              <button type="button" className="orden-btn" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </MensajeVacio>
          ) : (
            <section className="sec-prod-admin" aria-live="polite">
              <table className="tabla-prod-admin venc-tabla">
                <caption className="orden-visually-hidden">
                  Lotes registrados, con su producto, proveedor y estado de vencimiento
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Lote</th>
                    <th scope="col" aria-sort={ariaSort('fecha')}>
                      <button
                        type="button"
                        className="venc-ordenar"
                        onClick={() => alternarOrden('fecha')}
                      >
                        Vencimiento
                        <span aria-hidden="true">{indicadorOrden(orden, 'fecha')}</span>
                      </button>
                    </th>
                    <th scope="col">Días</th>
                    <th scope="col">Producto</th>
                    <th scope="col" aria-sort={ariaSort('proveedor')}>
                      <button
                        type="button"
                        className="venc-ordenar"
                        onClick={() => alternarOrden('proveedor')}
                      >
                        Proveedor
                        <span aria-hidden="true">{indicadorOrden(orden, 'proveedor')}</span>
                      </button>
                    </th>
                    <th scope="col" className="venc-col-numero">
                      Cantidad
                    </th>
                    <th scope="col" className="venc-col-numero">
                      Stock producto
                    </th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="orden-col-acciones">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((fila) => {
                    const abierta = detalleId === fila.id

                    return (
                      <Fragment key={fila.id}>
                        <tr>
                          <td className="venc-codigo">#{fila.id}</td>
                          <td className="venc-fecha">{formatearFecha(fila.fechaVencimiento)}</td>
                          <td className="venc-dias">{textoDias(fila.dias)}</td>
                          <td>
                            {fila.productoNombre}
                            {fila.producto?.marca ? (
                              <span className="venc-secundario"> · {fila.producto.marca}</span>
                            ) : null}
                          </td>
                          <td>{fila.proveedorNombre}</td>
                          <td className="venc-col-numero venc-numero">{fila.cantidad ?? '—'}</td>
                          <td className="venc-col-numero venc-numero">
                            {fila.producto?.stock ?? '—'}
                          </td>
                          <td>
                            <span className={`venc-badge venc-badge-${fila.estado.clave}`}>
                              {fila.estado.etiqueta}
                            </span>
                          </td>
                          <td className="orden-col-acciones">
                            <div className="orden-acciones">
                              <button
                                type="button"
                                className="orden-btn orden-btn-chico"
                                onClick={() => alternarDetalle(fila.id)}
                                aria-expanded={abierta}
                                aria-controls={`venc-detalle-${fila.id}`}
                              >
                                {abierta ? 'Ocultar' : 'Ver detalle'}
                              </button>
                              <button
                                type="button"
                                className="orden-btn orden-btn-chico"
                                onClick={() => abrirEdicion(fila)}
                              >
                                Editar fecha
                              </button>
                            </div>
                          </td>
                        </tr>

                        {abierta && (
                          <tr className="venc-fila-detalle">
                            <td colSpan={9} id={`venc-detalle-${fila.id}`}>
                              <DetalleLote lote={fila} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}

      {loteAEditar && (
        <Modal
          titulo={`Editar vencimiento — Lote #${loteAEditar.id}`}
          onCerrar={() => setLoteAEditar(null)}
          tamanio="chico"
        >
          <EditarVencimientoForm
            lote={loteAEditar}
            onGuardar={guardar}
            onCerrar={() => setLoteAEditar(null)}
          />
        </Modal>
      )}
    </section>
  )
}

function indicadorOrden(orden, campo) {
  if (orden.campo !== campo) return ' ↕'
  return orden.direccion === 'asc' ? ' ↑' : ' ↓'
}

export default VencimientosPage
