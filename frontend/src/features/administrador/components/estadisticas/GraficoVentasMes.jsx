import { LuChartColumn } from 'react-icons/lu'
import Spinner from '../../../../shared/components/Spinner'
import MensajeVacio from '../../../../shared/components/MensajeVacio'
import { formatearPrecio } from '../../../../shared/utils/formato'

const etiquetaFecha = (fecha) => {
  if (!fecha) return '-'
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio.slice(2)}`
}

function GraficoVentasMes({ ventas, diasConVentas, maxDia }) {
  return (
    <article className="estadistica-card">
      <h2 className="estadistica-card-titulo">Ventas del último mes</h2>
      {ventas.cargando ? (
        <Spinner texto="Cargando ventas..." />
      ) : ventas.error ? (
        <MensajeVacio titulo="Sin ventas" texto={ventas.error.message} />
      ) : diasConVentas.length === 0 ? (
        <div className="estadistica-vacio">
          <LuChartColumn className="estadistica-vacio-icono" size={48} aria-hidden="true" />
          <p className="estadistica-vacio-texto">No hubo ventas registradas en el período.</p>
        </div>
      ) : (
        <div className="estadistica-barras" role="img" aria-label="Ventas por día">
          {diasConVentas.map(([dia, total]) => (
            <div className="estadistica-barra-item" key={dia}>
              <span className="estadistica-barra-valor">{formatearPrecio(total)}</span>
              <div className="estadistica-barra" style={{ height: `${(total / maxDia) * 100}%` }} />
              <span className="estadistica-barra-etiqueta">{etiquetaFecha(dia)}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export default GraficoVentasMes
