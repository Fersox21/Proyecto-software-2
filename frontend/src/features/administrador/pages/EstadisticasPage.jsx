import { useState } from 'react'
import { useFetch } from '../../../shared/hooks/useFetch'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'
import {
  obtenerGananciasMensuales,
  obtenerProductosVencidos,
  obtenerMasVendidos,
  obtenerPromedioDiario
} from '../services/estadisticasService'
import { obtenerVentasUltimoMes } from '../services/ventasService'
import '../../../styles/panelAdmin/adminVentas.css'
import '../../../styles/panelAdmin/estadisticas.css'

const formatearDinero = (valor) =>
  `$${Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`

const nombreMes = (periodo) => {
  const [anio, mes] = periodo.split('-')
  const fecha = new Date(Number(anio), Number(mes) - 1, 1)
  const texto = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const etiquetaFecha = (fecha) => {
  if (!fecha) return '-'
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio.slice(2)}`
}

function EstadisticasPage() {
  const [mes, setMes] = useState(() => {
    const ayer = new Date()
    ayer.setMonth(ayer.getMonth() - 1)
    return `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}`
  })

  const ventas = useFetch(obtenerVentasUltimoMes)
  const ganancias = useFetch(obtenerGananciasMensuales)
  const vencidos = useFetch(obtenerProductosVencidos)
  const promedio = useFetch(obtenerPromedioDiario)
  const masVendidos = useFetch(obtenerMasVendidos, mes)

  const cargandoInicial =
    ventas.cargando && ganancias.cargando && vencidos.cargando && promedio.cargando

  if (cargandoInicial) return <Spinner texto="Cargando estadísticas..." />

  const listaVentas = ventas.datos || []
  const totalUltimoMes = listaVentas.reduce((acc, venta) => acc + Number(venta.total || 0), 0)

  const listaGanancias = ganancias.datos || []
  const ultimoMesGanancia = listaGanancias[listaGanancias.length - 1] || null

  const datosPromedio = promedio.datos || null

  const listaVencidos = vencidos.datos || []
  const productosVencidosUnicos = new Set(listaVencidos.map((item) => item.producto_id)).size

  // Ventas agrupadas por día para el gráfico
  const ventasPorDia = {}
  listaVentas.forEach((venta) => {
    const dia = String(venta.fecha).slice(0, 10)
    ventasPorDia[dia] = (ventasPorDia[dia] || 0) + Number(venta.total || 0)
  })
  const diasConVentas = Object.entries(ventasPorDia).sort(([a], [b]) => a.localeCompare(b))
  const maxDia = Math.max(...diasConVentas.map(([, total]) => total), 1)

  const listaMasVendidos = masVendidos.datos?.items || []
  const maxUnidades = Math.max(...listaMasVendidos.map((item) => Number(item.total_unidades || 0)), 1)

  return (
    <section className="main-admin" id="main-estadisticas">
      <header className="header-admin">
        <h1 className="h1-admin">Estadísticas</h1>
      </header>

      <section className="estadisticas-kpis" aria-live="polite">
        <article className="estadistica-kpi">
          <h2 className="estadistica-kpi-titulo">Ventas último mes</h2>
          <p className="estadistica-kpi-valor">{formatearDinero(totalUltimoMes)}</p>
          <p className="estadistica-kpi-subtitulo">
            {ventas.error
              ? ventas.error.message
              : `${listaVentas.length} ${listaVentas.length === 1 ? 'venta registrada' : 'ventas registradas'}`}
          </p>
        </article>

        <article className="estadistica-kpi">
          <h2 className="estadistica-kpi-titulo">Ganancia último mes</h2>
          <p className="estadistica-kpi-valor">
            {ganancias.error ? '—' : formatearDinero(ultimoMesGanancia?.ganancia)}
          </p>
          <p className="estadistica-kpi-subtitulo">
            {ganancias.error
              ? ganancias.error.message
              : ultimoMesGanancia
                ? `${nombreMes(ultimoMesGanancia.periodo)} · ingresos ${formatearDinero(ultimoMesGanancia.ingresos)}`
                : 'Sin datos'}
          </p>
        </article>

        <article className="estadistica-kpi">
          <h2 className="estadistica-kpi-titulo">Promedio de ventas diarias</h2>
          <p className="estadistica-kpi-valor">
            {promedio.error ? '—' : formatearDinero(promedio.datos?.promedio_diario)}
          </p>
          <p className="estadistica-kpi-subtitulo">
            {promedio.error
              ? promedio.error.message
              : datosPromedio
                ? `Últimos 30 días: ${formatearDinero(datosPromedio.total_30_dias)}`
                : 'Sin datos'}
          </p>
        </article>

        <article className="estadistica-kpi">
          <h2 className="estadistica-kpi-titulo">Productos vencidos</h2>
          <p className="estadistica-kpi-valor">{productosVencidosUnicos}</p>
          <p className="estadistica-kpi-subtitulo">
            {vencidos.error
              ? vencidos.error.message
              : `${listaVencidos.length} ${listaVencidos.length === 1 ? 'lote vencido' : 'lotes vencidos'}`}
          </p>
        </article>
      </section>

      <section className="estadisticas-grid">
        {/* Ventas del último mes */}
        <article className="estadistica-card">
          <h2 className="estadistica-card-titulo">Ventas del último mes</h2>
          {ventas.cargando ? (
            <Spinner texto="Cargando ventas..." />
          ) : ventas.error ? (
            <MensajeVacio titulo="Sin ventas" texto={ventas.error.message} />
          ) : diasConVentas.length === 0 ? (
            <p className="estadistica-vacio">No hubo ventas registradas en el período.</p>
          ) : (
            <div className="estadistica-barras" role="img" aria-label="Ventas por día">
              {diasConVentas.map(([dia, total]) => (
                <div className="estadistica-barra-item" key={dia}>
                  <span className="estadistica-barra-valor">{formatearDinero(total)}</span>
                  <div className="estadistica-barra" style={{ height: `${(total / maxDia) * 100}%` }} />
                  <span className="estadistica-barra-etiqueta">{etiquetaFecha(dia)}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Ganancias por mes */}
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
                      {formatearDinero(mesDatos.ganancia)}
                    </span>
                    <div className="estadistica-barras-dobles">
                      <div
                        className="estadistica-barra estadistica-barra-ingresos"
                        style={{
                          height: `${(Number(mesDatos.ingresos) / Math.max(...listaGanancias.map((m) => Number(m.ingresos)), 1)) * 100}%`
                        }}
                        title={`Ingresos ${formatearDinero(mesDatos.ingresos)}`}
                      />
                      <div
                        className="estadistica-barra estadistica-barra-ganancia"
                        style={{
                          height: `${(Number(mesDatos.ganancia) / Math.max(...listaGanancias.map((m) => Number(m.ingresos)), 1)) * 100}%`
                        }}
                        title={`Ganancia ${formatearDinero(mesDatos.ganancia)}`}
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

        <article className="estadistica-card">
          <div className="estadistica-card-encabezado">
            <h2 className="estadistica-card-titulo">Más vendidos por mes</h2>
            <label className="estadistica-selector-mes">
              Mes
              <input
                type="month"
                value={mes}
                onChange={(evento) => setMes(evento.target.value)}
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
                    <span>{formatearDinero(item.total_recaudado)}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </article>

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
      </section>
    </section>
  )
}

export default EstadisticasPage
