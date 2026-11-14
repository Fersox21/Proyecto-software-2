import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import { formatearPrecio } from '../../../shared/utils/formato'

function nombreMes(periodo) {
  if (!periodo) return ''
  const [anio, mes] = periodo.split('-')
  const fecha = new Date(Number(anio), Number(mes) - 1, 1)
  const texto = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function RankingMasVendidos({ masVendidos, listaMasVendidos, maxUnidades, mes, onMesChange }) {
  return (
    <article className="estadistica-card">
      <div className="estadistica-card-encabezado">
        <h2 className="estadistica-card-titulo">Más vendidos por mes</h2>
        <label className="estadistica-selector-mes">
          Mes
          <input
            type="month"
            value={mes}
            onChange={(e) => onMesChange(e.target.value)}
            aria-label="Seleccionar mes"
          />
        </label>
      </div>

      {masVendidos.cargando ? (
        <Spinner texto="Cargando ranking..." />
      ) : masVendidos.error ? (
        <MensajeVacio titulo="No pudimos cargar el ranking" texto={masVendidos.error.message} />
      ) : listaMasVendidos.length === 0 ? (
        <p className="estadistica-vacio">No hubo ventas registradas en {nombreMes(mes)}.</p>
      ) : (
        <ol className="estadistica-ranking">
          {listaMasVendidos.map((item, indice) => (
            <li className="estadistica-ranking-item" key={item.producto_id}>
              <span className="estadistica-ranking-pos">{indice + 1}</span>
              <div className="estadistica-ranking-datos">
                <div className="estadistica-ranking-nombre">
                  {item.nombre}
                  {item.marca ? <span className="estadistica-ranking-marca">{item.marca}</span> : null}
                </div>
                <div className="estadistica-ranking-progreso">
                  <div
                    className="estadistica-ranking-relleno"
                    style={{ width: `${(Number(item.total_unidades) / maxUnidades) * 100}%` }}
                  />
                </div>
              </div>
              <div className="estadistica-ranking-cifras">
                <strong>{item.total_unidades} u.</strong>
                <span>{formatearPrecio(item.total_recaudado)}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  )
}

export default RankingMasVendidos
