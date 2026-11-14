import { useCallback, useMemo, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useVencimientos } from '../hooks/useVencimientos'
import {
  DIAS_AVISO_POR_DEFECTO,
  compararPorProveedor,
  compararPorVencimiento,
  diasHasta,
  estadoVencimiento,
  hoyISO,
  nombreProducto,
  nombreProveedor,
  soloFecha,
} from '../utils/vencimientos'
import EditarVencimientoForm from '../components/vencimientos/EditarVencimientoForm'
import Modal from '../components/comunes/Modal'
import ResumenVencimientos from '../components/vencimientos/ResumenVencimientos'
import FiltrosVencimientos from '../components/vencimientos/FiltrosVencimientos'
import FilaVencimiento from '../components/vencimientos/FilaVencimiento'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/vencimientos.css'

const TODOS = 'todos'

function indicadorOrden(orden, campo) {
  if (orden.campo !== campo) return ' ↕'
  return orden.direccion === 'asc' ? ' ↑' : ' ↓'
}

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
          <ResumenVencimientos
            resumen={resumen}
            totalFilas={filas.length}
            estado={estado}
            umbral={umbral}
            onEstadoChange={setEstado}
          />

          <FiltrosVencimientos
            busqueda={busqueda}
            proveedorId={proveedorId}
            estado={estado}
            desde={desde}
            hasta={hasta}
            umbral={umbral}
            proveedores={proveedores}
            totalVisibles={visibles.length}
            totalFilas={filas.length}
            hayFiltrosActivos={hayFiltrosActivos}
            onBusquedaChange={setBusqueda}
            onProveedorChange={setProveedorId}
            onEstadoChange={setEstado}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onUmbralChange={setUmbral}
            onLimpiar={limpiarFiltros}
          />

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
                  {visibles.map((fila) => (
                    <FilaVencimiento
                      key={fila.id}
                      fila={fila}
                      abierta={detalleId === fila.id}
                      onAlternarDetalle={alternarDetalle}
                      onEditar={abrirEdicion}
                    />
                  ))}
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

export default VencimientosPage
