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

function GraficoGananciasMes({ ganancias, listaGanancias }) {
  const maxIngresos = Math.max(...listaGanancias.map((m) => Number(m.ingresos || 0)), 1)

  return (
    <article className="estadistica-card">
      <h2 className="estadistica-card-titulo">Ganancias por mes</h2>
      {ganancias.cargando ? (
        <Spinner texto="Cargando ganancias..." />
      ) : ganancias.error ? (
        <MensajeVacio titulo="Sin datos de ganancias" texto={ganancias.error.message} />
      ) : listaGanancias.length === 0 ? (
        <p className="estadistica-vacio">No hay ventas registradas en los últimos 12 meses.</p>
      ) : (
        <>
          <div className="estadistica-barras" role="img" aria-label="Ganancias por mes">
            {listaGanancias.map((mesDatos) => (
              <div className="estadistica-barra-item" key={mesDatos.periodo}>
                <span className="estadistica-barra-valor">
                  {formatearPrecio(mesDatos.ganancia)}
                </span>
                <div className="estadistica-barras-dobles">
                  <div
                    className="estadistica-barra estadistica-barra-ingresos"
                    style={{
                      height: `${(Number(mesDatos.ingresos) / maxIngresos) * 100}%`,
                    }}
                    title={`Ingresos ${formatearPrecio(mesDatos.ingresos)}`}
                  />
                  <div
                    className="estadistica-barra estadistica-barra-ganancia"
                    style={{
                      height: `${(Number(mesDatos.ganancia) / maxIngresos) * 100}%`,
                    }}
                    title={`Ganancia ${formatearPrecio(mesDatos.ganancia)}`}
                  />
                </div>
                <span className="estadistica-barra-etiqueta">{nombreMes(mesDatos.periodo)}</span>
              </div>
            ))}
          </div>
          <ul className="estadistica-leyenda">
            <li><span className="estadistica-cuadro estadistica-cuadro-ingresos" /> Ingresos</li>
            <li><span className="estadistica-cuadro estadistica-cuadro-ganancia" /> Ganancia</li>
          </ul>
        </>
      )}
    </article>
  )
}

export default GraficoGananciasMes
