import {
  obtenerVentas,
  obtenerVentaPorId,
  obtenerProductosVenta,
  actualizarVenta,
  eliminarVenta,
} from '../services/ventasService';
import { obtenerPedidoPorId } from '../services/pedidosService';
import { useState } from 'react';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
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
import HistorialVentas from '../components/ventas/HistorialVentas';
import '../../../styles/panelAdmin/adminVentas.css';
import '../../../styles/panelAdmin/ordenesCompra.css';
import '../../../styles/panelAdmin/adminPedidos.css';
import '../../../styles/panelAdmin/historial.css';

function VentasPage() {
  const [vistaHistorial, setVistaHistorial] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const { datos: ventas, cargando, error } = useFetch(obtenerVentas, recarga);

  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const [ventaAEditar, setVentaAEditar] = useState(null);
  const [fechaEditada, setFechaEditada] = useState('');
  const [totalModificadoEditado, setTotalModificadoEditado] = useState('');
  const [motivoEditado, setMotivoEditado] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  if (vistaHistorial) {
    return (
      <section className="main-admin" id="main-ventas">
        <header className="header-admin">
          <h1 className="h1-admin">Historial de Ventas</h1>
          <button
            type="button"
            className="orden-btn"
            onClick={() => setVistaHistorial(false)}
          >
            Volver al listado
          </button>
        </header>
        <HistorialVentas />
      </section>
    );
  }

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
      setMensaje({ tipo: 'exito', texto: 'Venta actualizada exitosamente.' });
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
      setMensaje({ tipo: 'exito', texto: 'Venta eliminada exitosamente.' });
    } catch (err) {
      setVentaAEliminar(null);
      setMensaje({ tipo: 'error', texto: err.message });
    }
  };

  return (
    <section className="main-admin" id="main-ventas">
      <header className="header-admin">
        <h1 className="h1-admin">Ventas</h1>
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

      <section className="sec-tabla-admin sec-tabla-ventas dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" aria-live="polite">
        <table className="tabla-admin tabla-ventas">
          <thead className="dark:bg-slate-900/50">
            <tr className="dark:border-slate-700">
              <th className="dark:text-slate-400 dark:border-slate-700">Venta y Fecha</th>
              <th className="dark:text-slate-400 dark:border-slate-700">Total y Auditoría</th>
              <th className="col-acciones dark:text-slate-400 dark:border-slate-700">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalVentas > 0 ? (
              listaVentas.map((venta, index) => {
                const totalModificado = venta.totalModificado ?? venta.total_modificado;
                const motivoModificacion = venta.motivoModificacion ?? venta.motivo_modificacion;
                const totalOriginal = venta.monto ?? venta.total ?? 0;
                const tieneModificacion = totalModificado != null;
                const precioFinal = tieneModificacion ? totalModificado : totalOriginal;

                return (
                  <tr key={venta.id} className="dark:border-slate-700 dark:hover:bg-slate-700/50">
                    <td className="col-admin dark:text-slate-200 dark:border-slate-700">
                      <div className="venta-id-fecha">
                        <span className="venta-id dark:text-slate-200">#{index + 1}</span>
                        <span className="venta-fecha dark:text-slate-400">
                          {venta.fecha ? formatearFecha(venta.fecha) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="col-admin col-monto dark:text-slate-200 dark:border-slate-700">
                      <div className="venta-total-bloque">
                        <div className="venta-total-linea">
                          <span className="venta-total-final dark:text-slate-200">
                            {formatearPrecio(precioFinal)}
                          </span>
                          {tieneModificacion && (
                            <span className="venta-total-original dark:text-slate-400">
                              {formatearPrecio(totalOriginal)}
                            </span>
                          )}
                        </div>
                        {motivoModificacion && (
                          <div className="venta-total-motivo dark:text-slate-400">{motivoModificacion}</div>
                        )}
                      </div>
                    </td>
                    <td className="col-admin col-acciones dark:border-slate-700">
                      <div className="venta-acciones">
                        <button
                          type="button"
                          className="venta-btn-icono venta-btn-ver"
                          aria-label="Ver detalle"
                          title="Ver detalle"
                          onClick={() => verDetalle(venta.id)}
                        >
                          <LuEye size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="venta-btn-icono venta-btn-editar"
                          aria-label="Editar venta"
                          title="Editar"
                          onClick={() => handleEditar(venta)}
                        >
                          <LuPencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="venta-btn-icono venta-btn-eliminar"
                          aria-label="Eliminar venta"
                          title="Eliminar"
                          onClick={() => setVentaAEliminar(venta)}
                        >
                          <LuTrash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="dark:border-slate-700">
                <td colSpan="3" className="col-vacia dark:text-slate-400 dark:border-slate-700">
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="tabla-admin-pie dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
          <span className="info-pag dark:text-slate-300">
            Mostrando {totalVentas > 0 ? 1 : 0}–{totalVentas} de {totalVentas}
          </span>
          <div className="control-pag">
            <button
              type="button"
              className="btn-pag dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              id="anterior-pag"
              aria-label="Página anterior"
            >
              ‹
            </button>
            <span className="nums-pag dark:text-slate-200">1</span>
            <button
              type="button"
              className="btn-pag dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              id="siguiente-pag"
              aria-label="Página siguiente"
            >
              ›
            </button>
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
              ¿Seguro que querés eliminar esta venta?
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
