import { useCallback, useEffect, useState } from 'react'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { useOrdenesCompra } from '../hooks/useOrdenesCompra'
import { obtenerOrdenCompraPorId, obtenerProductos } from '../services/ordenesCompraService'
import Modal from '../components/Modal'
import OrdenCompraForm from '../components/OrdenCompraForm'
import ConfirmarEliminacion from '../components/ConfirmarEliminacion'
import FilaOrdenCompra from '../components/FilaOrdenCompra'
import '../../../styles/panelAdmin/ordenesCompra.css'

function OrdenesCompraPage() {
  const { ordenes, cargando, error, recargar, crear, actualizar, eliminar } = useOrdenesCompra()

  const [mensaje, setMensaje] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [cargandoEdicion, setCargandoEdicion] = useState(false)
  const [ordenAEliminar, setOrdenAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [productosPorId, setProductosPorId] = useState({})

  // Catálogo de productos para resolver nombres en los lotes
  useEffect(() => {
    let ignorar = false

    obtenerProductos()
      .then((productos) => {
        if (ignorar || !Array.isArray(productos)) return
        const mapa = {}
        productos.forEach((p) => {
          mapa[p.id] = p.nombre
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
      setMensaje({ tipo: 'exito', texto: 'Orden de compra eliminada.' })
      if (detalle?.id === ordenAEliminar.id) setDetalle(null)
      setOrdenAEliminar(null)
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
      setOrdenAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }, [ordenAEliminar, eliminar, detalle])

  return (
    <section className="main-admin" id="main-ordenes-compra">
      <header className="header-admin">
        <h1 className="orden-h1">Órdenes de compra</h1>
        <button type="button" className="agregar-prod" onClick={abrirCrear}>
          + Nueva orden
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
              {ordenes.map((orden) => (
                <FilaOrdenCompra
                  key={orden.id}
                  orden={orden}
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
    </section>
  )
}

export default OrdenesCompraPage
