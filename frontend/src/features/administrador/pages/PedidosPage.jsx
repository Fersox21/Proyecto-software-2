import { useState } from 'react'
import { usePedidosAdmin } from '../hooks/usePedidosAdmin'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import FilaPedido from '../components/pedidos/FilaPedido'
import DetallePedidoModal from '../components/pedidos/DetallePedidoModal'
import ModalConfirmarCancelacion from '../components/pedidos/ModalConfirmarCancelacion'
import ModalConfirmarAceptacion from '../components/pedidos/ModalConfirmarAceptacion'
import HistorialPedidos from '../components/pedidos/HistorialPedidos'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/adminPedidos.css'
import '../../../styles/panelAdmin/historial.css'

function PedidosPage() {
  const {
    pedidos,
    cargando,
    error,
    pedidoDetalle,
    cargandoDetalle,
    errorDetalle,
    procesandoAccion,
    cargarDetallePedido,
    cerrarDetalle,
    modificarTotalPedido,
    aceptarPedido,
    cancelarPedido
  } = usePedidosAdmin()

  const [vistaHistorial, setVistaHistorial] = useState(false)
  const [pedidoParaAceptar, setPedidoParaAceptar] = useState(null)
  const [modificacionParaAceptar, setModificacionParaAceptar] = useState(null)
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleVerDetalle = async (id) => {
    setModalDetalleAbierto(true)
    try {
      await cargarDetallePedido(id)
    } catch {
      // Manejado internamente por el hook
    }
  }

  const handleCerrarDetalle = () => {
    setModalDetalleAbierto(false)
    cerrarDetalle()
  }

  const handleIniciarAceptar = (pedido, datosModificacion = null) => {
    setPedidoParaAceptar(pedido)
    setModificacionParaAceptar(datosModificacion)
  }

  const handleConfirmarAceptar = async (id, asignacionesLotes = null) => {
    try {
      await aceptarPedido(id, modificacionParaAceptar, asignacionesLotes)
      setPedidoParaAceptar(null)
      setModificacionParaAceptar(null)
      if (pedidoDetalle?.id === id) {
        setModalDetalleAbierto(false)
      }
      setMensaje({ tipo: 'exito', texto: 'Pedido aprobado exitosamente.' })
    } catch (err) {
      setPedidoParaAceptar(null)
      setModificacionParaAceptar(null)
      setMensaje({ tipo: 'error', texto: err.message })
    }
  }

  const handleGuardarModificacion = async (id, datosModificacion) => {
    await modificarTotalPedido(id, datosModificacion)
  }

  const handleIniciarCancelar = (pedido) => {
    setPedidoParaCancelar(pedido)
  }

  const handleConfirmarCancelar = async (id, motivoRechazo) => {
    try {
      await cancelarPedido(id, motivoRechazo)
      setPedidoParaCancelar(null)
      setMensaje({ tipo: 'exito', texto: 'El pedido ha sido cancelado.' })
    } catch (err) {
      setPedidoParaCancelar(null)
      setMensaje({ tipo: 'error', texto: err.message })
    }
  }

  if (vistaHistorial) {
    return (
      <section className="main-admin" id="main-pedidos">
        <header className="header-admin">
          <h1 className="h1-admin">Historial de Pedidos</h1>
          <button
            type="button"
            className="orden-btn"
            onClick={() => setVistaHistorial(false)}
          >
            Volver al listado
          </button>
        </header>
        <HistorialPedidos />
      </section>
    )
  }

  if (cargando) return <Spinner texto="Cargando pedidos..." />
  if (error) return <MensajeVacio titulo="No pudimos cargar los pedidos" texto={error.message} />

  const pedidosPendientes = (pedidos || []).filter((p) =>
    ['pendiente', 'nuevo'].includes(String(p.estado || '').toLowerCase())
  )
  const totalPedidos = pedidosPendientes.length

  return (
    <section className="main-admin" id="main-pedidos">
      <header className="header-admin">
        <h1 className="h1-admin">Gestión de Pedidos</h1>
        <button
          type="button"
          className="orden-btn"
          onClick={() => setVistaHistorial(true)}
        >
          Ver historial
        </button>
      </header>

      {mensaje && (
        <div
          className={`orden-alerta ${
            mensaje.tipo === 'error' ? 'orden-alerta-error' : 'orden-alerta-exito'
          }`}
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

      <section className="sec-prod-admin" aria-live="polite">
        <table className="tabla-prod-admin">
          <thead>
            <tr>
              <th>Cliente / Comercio</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th className="col-acciones-header">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalPedidos > 0 ? (
              pedidosPendientes.map((pedido, index) => (
                <FilaPedido
                  key={pedido.id}
                  pedido={pedido}
                  numeroFila={index + 1}
                  onVerDetalle={handleVerDetalle}
                  onIniciarAceptar={handleIniciarAceptar}
                  onIniciarCancelar={handleIniciarCancelar}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="pedido-tabla-vacia">
                  No hay pedidos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="tabla-admin-pie">
          <span id="info-pag">
            Mostrando {totalPedidos > 0 ? 1 : 0}–{totalPedidos} de {totalPedidos}
          </span>
          <div className="control-pag">
            <button type="button" id="anterior-pag">‹</button>
            <span id="nums-pag">1</span>
            <button type="button" id="siguiente-pag">›</button>
          </div>
        </div>
      </section>

      {/* Modal de Detalle */}
      {modalDetalleAbierto && (
        <DetallePedidoModal
          pedido={pedidoDetalle}
          cargando={cargandoDetalle}
          error={errorDetalle}
          procesandoAccion={procesandoAccion}
          onCerrar={handleCerrarDetalle}
          onGuardarModificacion={handleGuardarModificacion}
          onIniciarAceptar={handleIniciarAceptar}
          onIniciarCancelar={(ped) => {
            setPedidoParaCancelar(ped)
          }}
        />
      )}

      {/* Modal de Confirmación para Aceptar (Venta) */}
      <ModalConfirmarAceptacion
        pedido={pedidoParaAceptar}
        datosModificacion={modificacionParaAceptar}
        visible={Boolean(pedidoParaAceptar)}
        cargando={procesandoAccion}
        onConfirmar={handleConfirmarAceptar}
        onCerrar={() => {
          setPedidoParaAceptar(null)
          setModificacionParaAceptar(null)
        }}
      />

      {/* Modal de Confirmación para Cancelar */}
      <ModalConfirmarCancelacion
        pedido={pedidoParaCancelar}
        visible={Boolean(pedidoParaCancelar)}
        cargando={procesandoAccion}
        onConfirmar={handleConfirmarCancelar}
        onCerrar={() => setPedidoParaCancelar(null)}
      />
    </section>
  )
}

export default PedidosPage
