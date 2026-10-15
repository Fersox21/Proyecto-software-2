import { obtenerPedidos } from '../services/pedidosService'
import { useFetch } from '../../../shared/hooks/useFetch'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'

function PedidosPage(){

    const { datos: pedidos, cargando, error } = useFetch(obtenerPedidos)

     if (cargando) return <Spinner texto="Cargando pedidos..." />
     if (error) return <MensajeVacio titulo="No pudimos cargar los pedidos" texto={error.message} />

     const totalPedidos = pedidos ? pedidos.length : 0

    return(
        <section className="main-admin" id="main-pedidos">
      <header className="header-admin">
        <h1 className="h1-admin">Pedidos</h1>
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
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalPedidos > 0 ? (
              pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td className="col-admin">#{pedido.id}</td>
                  {/* Cambiado a pedido.comercio para coincidir con la entidad del backend */}
                  <td className="col-admin">{pedido.comercio || 'N/A'}</td> 
                  <td className="col-admin">{pedido.fecha}</td>
                  <td className="col-admin">${pedido.total ? pedido.total.toFixed(2) : '0.00'}</td>
                  <td className="col-admin">{pedido.estado}</td>
                  <td className="col-admin col-acciones">
                    <button type="button">Ver Detalle</button>
                  </td>
                </tr>
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
    </section>
    )
}

export default PedidosPage;