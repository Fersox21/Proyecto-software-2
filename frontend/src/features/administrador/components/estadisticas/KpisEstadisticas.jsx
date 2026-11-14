import { formatearPrecio } from '../../../../shared/utils/formato'

function nombreMes(periodo) {
  if (!periodo) return ''
  const [anio, mes] = periodo.split('-')
  const fecha = new Date(Number(anio), Number(mes) - 1, 1)
  const texto = fecha.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function KpisEstadisticas({
  totalUltimoMes,
  ventas,
  listaVentas,
  ultimoMesGanancia,
  ganancias,
  datosPromedio,
  promedio,
  productosVencidosUnicos,
  vencidos,
  listaVencidos,
}) {
  return (
    <section className="estadisticas-kpis" aria-live="polite">
      <article className="estadistica-kpi">
        <h2 className="estadistica-kpi-titulo">Ventas último mes</h2>
        <p className="estadistica-kpi-valor">{formatearPrecio(totalUltimoMes)}</p>
        <p className="estadistica-kpi-subtitulo">
          {ventas.error
            ? ventas.error.message
            : `${listaVentas.length} ${listaVentas.length === 1 ? 'venta registrada' : 'ventas registradas'}`}
        </p>
      </article>

      <article className="estadistica-kpi">
        <h2 className="estadistica-kpi-titulo">Ganancia último mes</h2>
        <p className="estadistica-kpi-valor">
          {ganancias.error ? '—' : formatearPrecio(ultimoMesGanancia?.ganancia || 0)}
        </p>
        <p className="estadistica-kpi-subtitulo">
          {ganancias.error
            ? ganancias.error.message
            : ultimoMesGanancia
              ? `${nombreMes(ultimoMesGanancia.periodo)} · ingresos ${formatearPrecio(ultimoMesGanancia.ingresos)}`
              : 'Sin datos'}
        </p>
      </article>

      <article className="estadistica-kpi">
        <h2 className="estadistica-kpi-titulo">Promedio de ventas diarias</h2>
        <p className="estadistica-kpi-valor">
          {promedio.error ? '—' : formatearPrecio(promedio.datos?.promedio_diario || 0)}
        </p>
        <p className="estadistica-kpi-subtitulo">
          {promedio.error
            ? promedio.error.message
            : datosPromedio
              ? `Últimos 30 días: ${formatearPrecio(datosPromedio.total_30_dias)}`
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
  )
}

export default KpisEstadisticas
