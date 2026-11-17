import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuPlus, LuSearch, LuX } from 'react-icons/lu'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { obtenerOrdenCompraPorId, obtenerProductos } from '../services/ordenesCompraService'
import { formatearFecha } from '../../../shared/utils/formato'
import Modal from '../components/comunes/Modal'
import OrdenCompraForm from '../components/ordenesCompra/OrdenCompraForm'
import ConfirmarEliminacion from '../components/ordenesCompra/ConfirmarEliminacion'
import FilaOrdenCompra from '../components/ordenesCompra/FilaOrdenCompra'
import HistorialOrdenesCompra from '../components/ordenesCompra/HistorialOrdenesCompra'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/historial.css'

function OrdenesCompraPage() {
  const { ordenes, cargando, error, recargar, crear, actualizar, eliminar } = useOrdenesCompra()

  const [vistaHistorial, setVistaHistorial] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [cargandoEdicion, setCargandoEdicion] = useState(false)
  const [ordenAEliminar, setOrdenAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [productosPorId, setProductosPorId] = useState({})

  const cargarProductos = useCallback(() => {
    return obtenerProductos()
      .then((productos) => {
        if (!Array.isArray(productos)) return
        const mapa = {}
        productos.forEach((p) => {
          mapa[p.id] = p.nombre
        })
        setProductosPorId(mapa)
      })
      .catch(() => {
        setProductosPorId({})
      })
  }, [])

  // Catálogo de productos para resolver nombres en los lotes
  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const abrirCrear = useCallback(() => {
    setMensaje(null)
    setFormulario({ modo: 'crear', orden: null })
  }, [])

  const abrirEditar = useCallback(async (orden) => {
    setMensaje(null)
    setCargandoEdicion(true)
    try {
      const completa = await obtenerOrdenCompraPorId(orden.id)
      setFormulario({ modo: 'editar', orden: completa })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setCargandoEdicion(false)
    }
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizar(formulario.orden.id, datos)
        setMensaje({ tipo: 'exito', texto: 'Orden de compra actualizada exitosamente.' })
      } else {
        await crear(datos)
        setMensaje({ tipo: 'exito', texto: 'Orden de compra registrada con éxito.' })
      }
      await cargarProductos()
      setFormulario(null)
      setDetalle(null)
    },
    [formulario, crear, actualizar, cargarProductos],
  )

const alternarDetalle = useCallback(
  async (orden) => {
      if (detalle?.id === orden.id) {
        setDetalle(null)
        return
      }

      setDetalle({ id: orden.id, orden: null, cargando: true, error: null })
      try {
        const completa = await obtenerOrdenCompraPorId(orden.id)
        setDetalle({ id: orden.id, orden: completa, cargando: false, error: null })
      } catch (err) {
        setDetalle({ id: orden.id, orden: null, cargando: false, error: err.message })
      }
    },
    [detalle],
  )

  const pedirEliminar = useCallback((orden) => {
    setMensaje(null)
    setOrdenAEliminar(orden)
  }, [])

  const cancelarEliminar = useCallback(() => setOrdenAEliminar(null), [])

  const confirmarEliminar = useCallback(async () => {
    if (!ordenAEliminar) return
    setEliminando(true)
    try {
      await eliminar(ordenAEliminar.id)
      setMensaje({ tipo: 'exito', texto: 'Orden de compra eliminada exitosamente.' })
      if (detalle?.id === ordenAEliminar.id) setDetalle(null)
      setOrdenAEliminar(null)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setOrdenAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }, [ordenAEliminar, eliminar, detalle])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return ordenes

    return ordenes.filter((orden) => {
      const proveedor = orden?.proveedor?.nombre || ''
      const contenido = [proveedor, formatearFecha(orden.fecha)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return contenido.includes(texto)
    })
  }, [ordenes, busqueda])

  const limpiarBusqueda = useCallback(() => setBusqueda(''), [])

  return (
    <section className="main-admin" id="main-ordenes-compra">
      <header className="header-admin">
        <h1 className="orden-h1">
          {vistaHistorial ? 'Historial de Órdenes de compra' : 'Órdenes de compra'}
        </h1>
        <button
          type="button"
          className="orden-btn"
          onClick={() => setVistaHistorial((v) => !v)}
        >
          {vistaHistorial ? 'Volver al listado' : 'Ver historial'}
        </button>
      </header>

      {vistaHistorial ? (
        <HistorialOrdenesCompra productosPorId={productosPorId} />
      ) : (
        <>

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

      {!cargando && !error && ordenes.length > 0 && (
        <div className="orden-toolbar">
          <div className="orden-toolbar-izquierda">
            <div className="orden-busqueda-wrapper">
              <LuSearch className="orden-busqueda-icono" size={16} aria-hidden="true" />
              <input
                type="search"
                className="orden-busqueda-input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por proveedor o fecha..."
                aria-label="Buscar órdenes de compra"
              />
              {busqueda && (
                <button
                  type="button"
                  className="orden-busqueda-limpiar"
                  onClick={limpiarBusqueda}
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                >
                  <LuX size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            <span className="orden-conteo">
              {visibles.length === ordenes.length
                ? `${ordenes.length} ${ordenes.length === 1 ? 'orden' : 'órdenes'}`
                : `${visibles.length} de ${ordenes.length} órdenes`}
            </span>
          </div>

          <button type="button" className="orden-btn-nuevo" onClick={abrirCrear}>
            <LuPlus size={18} aria-hidden="true" />
            <span>Nueva orden</span>
          </button>
        </div>
      )}

      {cargando && <Spinner texto="Cargando órdenes de compra..." />}

      {!cargando && error && (
        <MensajeVacio titulo="No pudimos cargar las órdenes de compra" texto={error.message}>
          <button type="button" className="orden-btn orden-btn-primario" onClick={recargar}>
            Reintentar
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && ordenes.length === 0 && (
        <MensajeVacio
          titulo="Todavía no hay órdenes de compra"
          texto="Creá la primera orden para empezar a registrar compras a proveedores."
        >
          <button type="button" className="orden-btn orden-btn-primario" onClick={abrirCrear}>
            Crear la primera orden
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && ordenes.length > 0 && visibles.length === 0 && (
        <MensajeVacio
          titulo="No se encontraron órdenes de compra"
          texto={`No hay ninguna orden que coincida con "${busqueda}".`}
        >
          <button type="button" className="orden-btn orden-btn-primario" onClick={limpiarBusqueda}>
            Limpiar búsqueda
          </button>
        </MensajeVacio>
      )}

      {!cargando && !error && visibles.length > 0 && (
        <section className="sec-prod-admin orden-tabla-contenedor" aria-live="polite">
          <table className="tabla-prod-admin orden-tabla">
            <caption className="orden-visually-hidden">
              Órdenes de compra registradas
            </caption>
            <thead>
              <tr>
                <th scope="col">Orden y fecha</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Total</th>
                <th scope="col" className="orden-col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((orden, index) => (
                <FilaOrdenCompra
                  key={orden.id}
                  orden={orden}
                  numeroFila={index + 1}
                  detalle={detalle}
                  productosPorId={productosPorId}
                  onAlternarDetalle={alternarDetalle}
                  onEditar={abrirEditar}
                  onEliminar={pedirEliminar}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      {cargandoEdicion && (
        <Modal titulo="Cargando orden de compra" onCerrar={() => setCargandoEdicion(false)} tamanio="chico">
          <div className="orden-modal-cuerpo">
            <p className="orden-form-cargando" role="status">
              Buscando los lotes de la orden...
            </p>
          </div>
        </Modal>
      )}

      {formulario && (
        <Modal
          titulo={formulario.modo === 'editar' ? 'Editar orden de compra' : 'Nueva orden de compra'}
          onCerrar={cerrarFormulario}
        >
          <OrdenCompraForm orden={formulario.orden} onGuardar={guardar} onCerrar={cerrarFormulario} />
        </Modal>
      )}

      {ordenAEliminar && (
        <ConfirmarEliminacion
          orden={ordenAEliminar}
          eliminando={eliminando}
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
        </>
      )}
    </section>
  )
}

export default OrdenesCompraPage
