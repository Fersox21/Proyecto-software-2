import { Fragment, useCallback, useEffect, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { obtenerOrdenCompraPorId, obtenerProductos } from '../services/ordenesCompraService'
import Modal from '../components/Modal'
import OrdenCompraForm from '../components/OrdenCompraForm'
import ConfirmarEliminacion from '../components/ConfirmarEliminacion'
import '../../../styles/panelAdmin/ordenesCompra.css'

function nombreProveedor(orden) {
  if (orden?.proveedor?.nombre) return orden.proveedor.nombre
  if (orden?.proveedor?.id != null) return `Proveedor #${orden.proveedor.id}`
  return 'Sin proveedor'
}

function OrdenesCompraPage() {
  const { ordenes, cargando, error, recargar, crear, actualizar, eliminar } = useOrdenesCompra()

  const [mensaje, setMensaje] = useState(null)

  const [formulario, setFormulario] = useState(null)
  const [cargandoEdicion, setCargandoEdicion] = useState(false)

  const [ordenAEliminar, setOrdenAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  const [detalle, setDetalle] = useState(null)
  const [productosPorId, setProductosPorId] = useState({})

  // Los nombres de producto no vienen en el detalle de la orden (solo el id),
  // así que se resuelven con el catálogo. Si falla, la tabla muestra el id.
  useEffect(() => {
    let ignorar = false

    obtenerProductos()
      .then((productos) => {
        if (ignorar || !Array.isArray(productos)) return
        const mapa = {}
        productos.forEach((producto) => {
          mapa[producto.id] = producto.nombre
        })
        setProductosPorId(mapa)
      })
      .catch(() => {
        if (!ignorar) setProductosPorId({})
      })

    return () => {
      ignorar = true
    }
  }, [])

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
    } catch (nuevoError) {
      setMensaje({ tipo: 'error', texto: nuevoError.message })
    } finally {
      setCargandoEdicion(false)
    }
  }, [])

  const cerrarFormulario = useCallback(() => setFormulario(null), [])

  const guardar = useCallback(
    async (datos) => {
      if (formulario?.modo === 'editar') {
        await actualizar(formulario.orden.id, datos)
        setMensaje({ tipo: 'exito', texto: 'Orden de compra actualizada.' })
      } else {
        await crear(datos)
        setMensaje({ tipo: 'exito', texto: 'Orden de compra creada.' })
      }

      setFormulario(null)
      setDetalle(null)
    },
    [formulario, crear, actualizar],
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
      } catch (nuevoError) {
        setDetalle({ id: orden.id, orden: null, cargando: false, error: nuevoError.message })
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
      setMensaje({ tipo: 'exito', texto: 'Orden de compra eliminada.' })
      if (detalle?.id === ordenAEliminar.id) setDetalle(null)
      setOrdenAEliminar(null)
    } catch (nuevoError) {
      setMensaje({ tipo: 'error', texto: nuevoError.message })
      setOrdenAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }, [ordenAEliminar, eliminar, detalle])

  const encabezado = (
    <header className="header-admin">
      <h1 className="orden-h1">Órdenes de compra</h1>
      <button type="button" className="agregar-prod" onClick={abrirCrear}>
        + Nueva orden
      </button>
    </header>
  )

  return (
    <section className="main-admin" id="main-ordenes-compra">
      {encabezado}

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

      {!cargando && !error && ordenes.length > 0 && (
        <section className="sec-prod-admin" aria-live="polite">
          <table className="tabla-prod-admin orden-tabla">
            <caption className="orden-visually-hidden">
              Órdenes de compra registradas
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Fecha</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Total</th>
                <th scope="col" className="orden-col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => {
                const abierta = detalle?.id === orden.id

                return (
                  <Fragment key={orden.id}>
                    <tr>
                      <td className="orden-col-id">{orden.id}</td>
                      <td>{formatearFecha(orden.fecha)}</td>
                      <td>{nombreProveedor(orden)}</td>
                      <td className="orden-col-monto">{formatearPrecio(orden.total)}</td>
                      <td className="orden-col-acciones">
                        <div className="orden-acciones">
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico"
                            onClick={() => alternarDetalle(orden)}
                            aria-expanded={abierta}
                            aria-controls={`orden-lotes-${orden.id}`}
                          >
                            {abierta ? 'Ocultar lotes' : 'Ver lotes'}
                          </button>
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico"
                            onClick={() => abrirEditar(orden)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico orden-btn-peligro"
                            onClick={() => pedirEliminar(orden)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {abierta && (
                      <tr className="orden-fila-detalle">
                        <td colSpan={6} id={`orden-lotes-${orden.id}`}>
                          {detalle.cargando && (
                            <p className="orden-detalle-estado">Cargando lotes...</p>
                          )}

                          {!detalle.cargando && detalle.error && (
                            <p className="orden-detalle-estado orden-detalle-error" role="alert">
                              {detalle.error}
                            </p>
                          )}

                          {!detalle.cargando &&
                            !detalle.error &&
                            (detalle.orden?.lotes ?? []).length === 0 && (
                              <p className="orden-detalle-estado">
                                Esta orden no tiene lotes cargados.
                              </p>
                            )}

                          {!detalle.cargando &&
                            !detalle.error &&
                            (detalle.orden?.lotes ?? []).length > 0 && (
                              <table className="orden-tabla-lotes">
                                <caption className="orden-visually-hidden">
                                  Lotes de la orden {orden.id}
                                </caption>
                                <thead>
                                  <tr>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Fecha de arribo</th>
                                    <th scope="col">Fecha de vencimiento</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detalle.orden.lotes.map((lote) => {
                                    const idProducto = lote.producto?.id
                                    const nombre = productosPorId[idProducto]

                                    return (
                                      <tr key={lote.id ?? `${idProducto}-${lote.fechaVencimiento}`}>
                                        <td>
                                          {nombre ||
                                            (idProducto != null
                                              ? `Producto #${idProducto}`
                                              : 'Sin producto')}
                                        </td>
                                        <td>{lote.cantidad} Unidades </td>
                                        <td>{formatearFecha(lote.fechaArribo)}</td>
                                        <td>{formatearFecha(lote.fechaVencimiento)}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
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
    </section>
  )
}

export default OrdenesCompraPage
