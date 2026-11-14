import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'

const etiquetaFecha = (fecha) => {
  if (!fecha) return '-'
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio.slice(2)}`
}

function TablaProductosVencidos({ vencidos, listaVencidos }) {
  return (
    <article className="estadistica-card">
      <h2 className="estadistica-card-titulo">Productos vencidos</h2>
      {vencidos.cargando ? (
        <Spinner texto="Cargando vencimientos..." />
      ) : vencidos.error ? (
        <MensajeVacio titulo="No pudimos cargar los vencidos" texto={vencidos.error.message} />
      ) : listaVencidos.length === 0 ? (
        <p className="estadistica-vacio">No hay lotes vencidos. ¡Todo al día!</p>
      ) : (
        <div className="estadistica-tabla-contenedor">
          <table className="tabla-admin estadistica-tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Días vencido</th>
              </tr>
            </thead>
            <tbody>
              {listaVencidos.map((item) => (
                <tr key={item.lote_id}>
                  <td className="col-id">{item.nombre}</td>
                  <td>{item.marca || '-'}</td>
                  <td>#{item.lote_id}</td>
                  <td>{etiquetaFecha(item.fecha_vencimiento)}</td>
                  <td>
                    <span className="badge-estado estado-cancelado">{item.dias_vencido} días</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}

export default TablaProductosVencidos
