import {
  obtenerVentas,
  obtenerVentaPorId,
  obtenerProductosVenta,
  actualizarVenta,
  eliminarVenta,
} from '../services/ventasService';
import { obtenerPedidoPorId } from '../services/pedidosService';
import { useState } from 'react';
import { useFetch } from '../../../shared/hooks/useFetch';
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato';
import {
  bloquearTeclasNoNumericas,
  sanitizarDecimalPositivo,
} from '../../../shared/utils/validaciones';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';
import Modal from '../components/comunes/Modal';
import DetalleVentaModal from '../components/ventas/DetalleVentaModal';
import '../../../styles/panelAdmin/adminVentas.css';
import '../../../styles/panelAdmin/ordenesCompra.css';
import '../../../styles/panelAdmin/adminPedidos.css';

function VentasPage() {
  const [recarga, setRecarga] = useState(0);
  const { datos: ventas, cargando, error } = useFetch(obtenerVentas, recarga);

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  const [ventaAEditar, setVentaAEditar] = useState(null);
  const [fechaEditada, setFechaEditada] = useState('');
  const [totalModificadoEditado, setTotalModificadoEditado] = useState('');
  const [motivoEditado, setMotivoEditado] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  if (cargando) return <Spinner texto="Cargando ventas..." />;
  if (error) return <MensajeVacio titulo="No pudimos cargar las ventas" texto={error.message} />;

  const listaVentas = Array.isArray(ventas) ? ventas : [];
  const totalVentas = listaVentas.length;

  const verDetalle = async (ventaId) => {
    setModalDetalleAbierto(true);
    setCargandoDetalle(true);
    setErrorDetalle('');
    setVentaDetalle(null);

    try {
      const detalle = await obtenerVentaPorId(ventaId);
      let pedido = detalle?.pedido || null;
      let items = detalle?.items || detalle?.productos || pedido?.items || pedido?.tiene || pedido?.productos || null;

      const pedidoId = detalle?.pedido_id ?? detalle?.pedidoId;
      if (!pedido && pedidoId) {
        try {
          pedido = await obtenerPedidoPorId(pedidoId);
          if (!items) {
            items = pedido?.items || pedido?.tiene || pedido?.productos || null;
          }
        } catch {
          // Continúa con los datos disponibles de la venta
        }
      }

      if (!items) {
        try {
          items = await obtenerProductosVenta(ventaId);
        } catch {
          items = [];
        }
      }

      setVentaDetalle({
        ...detalle,
        pedido: pedido || detalle?.pedido || {},
        items: Array.isArray(items) ? items : [],
      });
    } catch (err) {
      setErrorDetalle(err.message || 'No se pudo cargar el detalle de la venta.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setVentaDetalle(null);
    setErrorDetalle('');
  };

  const handleEditar = (venta) => {
    setVentaAEditar(venta);
    setFechaEditada(venta.fecha ? String(venta.fecha).slice(0, 10) : '');
    const totalOriginal = venta.monto ?? venta.total ?? '';
    const totalMod = venta.totalModificado ?? venta.total_modificado;
    setTotalModificadoEditado(
      totalMod != null ? String(totalMod) : (totalOriginal !== '' ? String(totalOriginal) : '')
    );
    setMotivoEditado(venta.motivoModificacion ?? venta.motivo_modificacion ?? '');
    setErrorModal('');
  };

  const totalOriginalEdicion = Number(ventaAEditar?.monto ?? ventaAEditar?.total ?? 0);
  const precioIngresadoStr = String(totalModificadoEditado ?? '').trim();
  const precioIngresado = Number(precioIngresadoStr);
  const precioModificado =
    precioIngresadoStr !== '' &&
    Number.isFinite(precioIngresado) &&
    precioIngresado !== totalOriginalEdicion;

  const guardarEdicion = async (e) => {
    e.preventDefault();

    if (!fechaEditada) {
      setErrorModal('Completá una fecha válida.');
      return;
    }

    if (precioIngresadoStr === '' || !Number.isFinite(precioIngresado) || precioIngresado <= 0) {
      setErrorModal('El precio final debe ser mayor a 0.');
      return;
    }

    if (precioModificado && !motivoEditado.trim()) {
      setErrorModal('Ingresá el motivo de la modificación del precio.');
      return;
    }

    try {
      await actualizarVenta(ventaAEditar.id, {
        fecha: fechaEditada,
        total: totalOriginalEdicion,
        estado: true,
        pedido_id: ventaAEditar.pedido_id ?? ventaAEditar.pedidoId,
        totalModificado: precioModificado ? precioIngresado : null,
        motivoModificacion: precioModificado ? motivoEditado.trim() : null,
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
      if (ventaDetalle?.id === ventaAEliminar.id) {
        cerrarDetalle();
      }
      setVentaAEliminar(null);
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
                const totalModificado = venta.totalModificado ?? venta.total_modificado;
                const motivoModificacion = venta.motivoModificacion ?? venta.motivo_modificacion;
                const totalOriginal = venta.monto ?? venta.total ?? 0;

                return (
                  <tr key={venta.id}>
                    <td className="col-admin col-id">#{venta.id}</td>
                    <td className="col-admin col-fecha">
                      {venta.fecha ? formatearFecha(venta.fecha) : '-'}
                    </td>
                    <td className="col-admin col-monto">
                      {totalModificado != null ? (
                        <div style={{ whiteSpace: 'normal' }}>
                          <span>
                            Total: {formatearPrecio(totalOriginal)} (Modificado a: {formatearPrecio(totalModificado)})
                          </span>
                          {motivoModificacion && (
                            <div className="detalle-etiqueta" style={{ marginTop: '0.2rem', fontWeight: 400 }}>
                              Motivo: {motivoModificacion}
                            </div>
                          )}
                        </div>
                      ) : (
                        formatearPrecio(totalOriginal)
                      )}
                    </td>
                    <td className="col-admin col-acciones">
                      <div className="orden-acciones">
                        <button
                          type="button"
                          className="orden-btn orden-btn-chico"
                          onClick={() => verDetalle(venta.id)}
                        >
                          Ver detalle
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

      {modalDetalleAbierto && (
        <DetalleVentaModal
          venta={ventaDetalle}
          cargando={cargandoDetalle}
          error={errorDetalle}
          onCerrar={cerrarDetalle}
        />
      )}

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
                    onChange={(e) => {
                      setFechaEditada(e.target.value);
                      setErrorModal('');
                    }}
                  />
                </div>

                <div className="orden-campo">
                  <label htmlFor="venta-total-original">Total original</label>
                  <input
                    id="venta-total-original"
                    type="text"
                    value={formatearPrecio(totalOriginalEdicion)}
                    disabled
                    readOnly
                  />
                </div>

                <div className="orden-campo">
                  <label htmlFor="venta-total-modificado">Modificar Precio Final</label>
                  <input
                    id="venta-total-modificado"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder={String(totalOriginalEdicion)}
                    value={totalModificadoEditado}
                    onKeyDown={(e) => bloquearTeclasNoNumericas(e, true)}
                    onChange={(e) => {
                      setTotalModificadoEditado(sanitizarDecimalPositivo(e.target.value));
                      setErrorModal('');
                    }}
                  />
                </div>

                {precioModificado && (
                  <div className="orden-campo">
                    <label htmlFor="venta-motivo-modificacion">Motivo de la modificación</label>
                    <input
                      id="venta-motivo-modificacion"
                      type="text"
                      placeholder="Explicá el motivo del ajuste..."
                      value={motivoEditado}
                      onChange={(e) => {
                        setMotivoEditado(e.target.value);
                        setErrorModal('');
                      }}
                    />
                  </div>
                )}
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
