import { obtenerVentas } from '../services/ventasService';
import { useState } from 'react';
import { useFetch } from '../../../shared/hooks/useFetch';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';
import '../../../styles/panelAdmin/adminVentas.css'

function VentasPage() {
  const { datos: ventas, cargando, error } = useFetch(obtenerVentas);
  const [ventaAEditar, setVentaAEditar] = useState(null);

  if (cargando) return <Spinner texto="Cargando ventas..." />;
  if (error) return <MensajeVacio titulo="No pudimos cargar las ventas" texto={error.message} />;

  const listaVentas = ventas || [];
  const totalVentas = listaVentas.length;

  const handleEditar = (venta) => {
    setVentaAEditar(venta);
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
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {totalVentas > 0 ? (
              listaVentas.map((venta) => (
                <tr key={venta.id}>
                  <td className="col-admin col-id">#{venta.id}</td>
                  <td className="col-admin col-fecha">
                    {venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-AR') : '-'}
                  </td>
                  <td className="col-admin col-monto">
                    ${Number(venta.monto || venta.total || 0).toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="col-admin col-acciones">
                    <button
                      type="button"
                      className="btn-accion btn-editar"
                      onClick={() => handleEditar(venta)}
                      aria-label={`Editar venta ${venta.id}`}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
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
    </section>
  );
}

export default VentasPage;