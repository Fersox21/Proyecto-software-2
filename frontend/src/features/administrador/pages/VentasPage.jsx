import {
  obtenerVentas,
  obtenerProductosVenta,
  actualizarVenta,
  eliminarVenta,
} from '../services/ventasService';
import { Fragment, useState } from 'react';
import { useFetch } from '../../../shared/hooks/useFetch';
import { formatearFecha } from '../../../shared/utils/formato';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';
import Modal from '../components/Modal';
import '../../../styles/panelAdmin/adminVentas.css';
import '../../../styles/panelAdmin/ordenesCompra.css';

function VentasPage() {
  const [recarga, setRecarga] = useState(0);
  const { datos: ventas, cargando, error } = useFetch(obtenerVentas, recarga);

  const [ventaAbiertaId, setVentaAbiertaId] = useState(null);
  const [productosVenta, setProductosVenta] = useState([]);

  const [ventaAEditar, setVentaAEditar] = useState(null);
  const [fechaEditada, setFechaEditada] = useState('');
  const [totalEditado, setTotalEditado] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  if (cargando) return <Spinner texto="Cargando ventas..." />;
  if (error) return <MensajeVacio titulo="No pudimos cargar las ventas" texto={error.message} />;

  const listaVentas = ventas || [];
  const totalVentas = listaVentas.length;

  const verProductos = async (ventaId) => {
    if (ventaAbiertaId === ventaId) {
      setVentaAbiertaId(null);
      setProductosVenta([]);
      return;
    }

    try {
      const items = await obtenerProductosVenta(ventaId);
      setProductosVenta(items || []);
      setVentaAbiertaId(ventaId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditar = (venta) => {
    setVentaAEditar(venta);
    setFechaEditada(venta.fecha ? String(venta.fecha).slice(0, 10) : '');
    setTotalEditado(venta.total || '');
    setErrorModal('');
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    if (!fechaEditada || !totalEditado || Number(totalEditado) <= 0) {
      setErrorModal('Completá una fecha válida y un total mayor a 0.');
      return;
    }

    try {
      await actualizarVenta(ventaAEditar.id, {
        fecha: fechaEditada,
        total: Number(totalEditado),
        estado: true,
        pedidoId: ventaAEditar.pedidoId || 1,
      });
      setVentaAEditar(null);
      setRecarga(recarga + 1);
    } catch (err) {
      setErrorModal(err.message);
    }
  };

  const confirmarEliminar = async () => {
    try {
      await eliminarVenta(ventaAEliminar.id);
      setVentaAEliminar(null);
      if (ventaAbiertaId === ventaAEliminar.id) {
        setVentaAbiertaId(null);
      }
      setRecarga(recarga + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="main-admin" id="main-ventas">
      <header className="header-admin">
        <h1 className="h1-admin">Ventas</h1>
      </header>

      <section className="sec-tabla-admin" aria-live="polite">
        <table className="tabla-admin">
          <thead>
            <tr>
              <th># Venta</th>
              <th>Fecha</th>
              <th>Total</th>
              <th className="orden-col-acciones">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalVentas > 0 ? (
              listaVentas.map((venta) => {
                const abierta = ventaAbiertaId === venta.id;

                return (
                  <Fragment key={venta.id}>
                    <tr>
                      <td className="col-admin col-id">#{venta.id}</td>
                      <td className="col-admin col-fecha">
                        {venta.fecha ? formatearFecha(venta.fecha) : '-'}
                      </td>
                      <td className="col-admin col-monto">
                        ${Number(venta.monto || venta.total || 0).toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="col-admin col-acciones">
                        <div className="orden-acciones">
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico"
                            onClick={() => verProductos(venta.id)}
                          >
                            {abierta ? 'Ocultar productos' : 'Ver productos'}
                          </button>
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico"
                            onClick={() => handleEditar(venta)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="orden-btn orden-btn-chico orden-btn-peligro"
                            onClick={() => setVentaAEliminar(venta)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {abierta && (
                      <tr className="orden-fila-detalle">
                        <td colSpan="4">
                          {productosVenta.length === 0 ? (
                            <p className="orden-detalle-estado">
                              Esta venta no tiene productos cargados.
                            </p>
                          ) : (
                            <table className="orden-tabla-lotes">
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th>Marca</th>
                                  <th>Cantidad</th>
                                  <th>Precio unitario</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productosVenta.map((item, idx) => (
                                  <tr key={item.id || idx}>
                                    <td>{item.producto?.nombre || `Producto #${item.producto?.id}`}</td>
                                    <td>{item.producto?.marca || '-'}</td>
                                    <td>{item.cantidad} unidades</td>
                                    <td>${Number(item.precio || 0).toLocaleString('es-AR')}</td>
                                    <td>
                                      ${Number((item.cantidad || 0) * (item.precio || 0)).toLocaleString('es-AR')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="col-vacia">
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="tabla-admin-pie">
          <span className="info-pag">
            Mostrando {totalVentas > 0 ? 1 : 0}–{totalVentas} de {totalVentas}
          </span>
          <div className="control-pag">
            <button type="button" className="btn-pag" id="anterior-pag">‹</button>
            <span className="nums-pag">1</span>
            <button type="button" className="btn-pag" id="siguiente-pag">›</button>
          </div>
        </div>
      </section>

      {ventaAEditar && (
        <Modal titulo="Editar venta" onCerrar={() => setVentaAEditar(null)}>
          <form className="orden-form" onSubmit={guardarEdicion}>
            <div className="orden-modal-cuerpo">
              {errorModal && (
                <div className="orden-alerta orden-alerta-error">
                  {errorModal}
                </div>
              )}

              <div className="orden-form-grilla">
                <div className="orden-campo">
                  <label htmlFor="venta-fecha">Fecha</label>
                  <input
                    id="venta-fecha"
                    type="date"
                    value={fechaEditada}
                    onChange={(e) => setFechaEditada(e.target.value)}
                  />
                </div>

                <div className="orden-campo">
                  <label htmlFor="venta-total">Total</label>
                  <input
                    id="venta-total"
                    type="number"
                    step="0.01"
                    value={totalEditado}
                    onChange={(e) => setTotalEditado(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="orden-modal-acciones">
              <button
                type="button"
                className="orden-btn"
                onClick={() => setVentaAEditar(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="orden-btn orden-btn-primario">
                Guardar cambios
              </button>
            </div>
          </form>
        </Modal>
      )}

      {ventaAEliminar && (
        <Modal titulo="Eliminar venta" onCerrar={() => setVentaAEliminar(null)} tamanio="chico">
          <div className="orden-modal-cuerpo">
            <p className="orden-confirmar-texto">
              ¿Seguro que querés eliminar la venta <strong>#{ventaAEliminar.id}</strong>?
            </p>
          </div>

          <div className="orden-modal-acciones">
            <button
              type="button"
              className="orden-btn"
              onClick={() => setVentaAEliminar(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="orden-btn orden-btn-peligro"
              onClick={confirmarEliminar}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default VentasPage;
