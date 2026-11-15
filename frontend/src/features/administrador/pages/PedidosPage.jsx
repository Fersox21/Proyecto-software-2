import { useState } from 'react'
import { usePedidosAdmin } from '../hooks/usePedidosAdmin'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import FilaPedido from '../components/pedidos/FilaPedido'
import DetallePedidoModal from '../components/pedidos/DetallePedidoModal'
import ModalConfirmarCancelacion from '../components/pedidos/ModalConfirmarCancelacion'
import ModalConfirmarAceptacion from '../components/pedidos/ModalConfirmarAceptacion'
import '../../../styles/panelAdmin/ordenesCompra.css'
import '../../../styles/panelAdmin/adminPedidos.css'

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
    aceptarPedido,
    cancelarPedido
  } = usePedidosAdmin()

  const [pedidoParaAceptar, setPedidoParaAceptar] = useState(null)
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)

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

  const handleIniciarAceptar = (pedido) => {
    setPedidoParaAceptar(pedido)
  }

  const handleConfirmarAceptar = async (id) => {
    try {
      await aceptarPedido(id)
      setPedidoParaAceptar(null)
    } catch (err) {
      alert(`Error al aceptar pedido: ${err.message}`)
    }
  }

  const handleIniciarCancelar = (pedido) => {
    setPedidoParaCancelar(pedido)
  }

  const handleConfirmarCancelar = async (id, motivoRechazo) => {
    try {
      await cancelarPedido(id, motivoRechazo)
      setPedidoParaCancelar(null)
    } catch (err) {
      alert(`Error al cancelar pedido: ${err.message}`)
    }
  }

  if (cargando) return <Spinner texto="Cargando pedidos..." />
  if (error) return <MensajeVacio titulo="No pudimos cargar los pedidos" texto={error.message} />

  const totalPedidos = pedidos ? pedidos.length : 0

  return (
    <section className="main-admin" id="main-pedidos">
      <header className="header-admin">
        <h1 className="h1-admin">Gestión de Pedidos</h1>
      </header>

      <section className="sec-prod-admin" aria-live="polite">
        <table className="tabla-prod-admin">
          <thead>
            <tr>
              <th># Pedido</th>
              <th>Comercio</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalPedidos > 0 ? (
              pedidos.map((pedido) => (
                <FilaPedido
                  key={pedido.id}
                  pedido={pedido}
                  onVerDetalle={handleVerDetalle}
                  onIniciarAceptar={handleIniciarAceptar}
                  onIniciarCancelar={handleIniciarCancelar}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
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
          onCerrar={handleCerrarDetalle}
          onIniciarAceptar={(ped) => {
            setPedidoParaAceptar(ped)
          }}
          onIniciarCancelar={(ped) => {
            setPedidoParaCancelar(ped)
          }}
        />
      )}

      {/* Modal de Confirmación para Aceptar (Venta) */}
      <ModalConfirmarAceptacion
        pedido={pedidoParaAceptar}
        visible={Boolean(pedidoParaAceptar)}
        cargando={procesandoAccion}
        onConfirmar={handleConfirmarAceptar}
        onCerrar={() => setPedidoParaAceptar(null)}
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
