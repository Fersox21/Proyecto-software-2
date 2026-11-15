import { useMemo, useState } from 'react'
import { useFetch } from '../../../shared/hooks/useFetch'
import Spinner from '../../../shared/components/Spinner'
import {
  obtenerGananciasMensuales,
  obtenerProductosVencidos,
  obtenerMasVendidos,
  obtenerPromedioDiario,
} from '../services/estadisticasService'
import { obtenerVentasUltimoMes } from '../services/ventasService'
import KpisEstadisticas from '../components/estadisticas/KpisEstadisticas'
import GraficoVentasMes from '../components/estadisticas/GraficoVentasMes'
import GraficoGananciasMes from '../components/estadisticas/GraficoGananciasMes'
import RankingMasVendidos from '../components/estadisticas/RankingMasVendidos'
import TablaProductosVencidos from '../components/estadisticas/TablaProductosVencidos'
import '../../../styles/panelAdmin/adminVentas.css'
import '../../../styles/panelAdmin/estadisticas.css'

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

  const listaVentas = useMemo(() => ventas.datos || [], [ventas.datos])
  const totalUltimoMes = useMemo(
    () => listaVentas.reduce((acc, v) => acc + Number(v.total || 0), 0),
    [listaVentas],
  )

  const listaGanancias = useMemo(() => ganancias.datos || [], [ganancias.datos])
  const ultimoMesGanancia = listaGanancias[listaGanancias.length - 1] || null

  const listaVencidos = useMemo(() => vencidos.datos || [], [vencidos.datos])
  const productosVencidosUnicos = useMemo(
    () => new Set(listaVencidos.map((item) => item.producto_id)).size,
    [listaVencidos],
  )

  const diasConVentas = useMemo(() => {
    const ventasPorDia = {}
    listaVentas.forEach((v) => {
      const dia = String(v.fecha).slice(0, 10)
      ventasPorDia[dia] = (ventasPorDia[dia] || 0) + Number(v.total || 0)
    })
    return Object.entries(ventasPorDia).sort(([a], [b]) => a.localeCompare(b))
  }, [listaVentas])

  const maxDia = useMemo(
    () => Math.max(...diasConVentas.map(([, total]) => total), 1),
    [diasConVentas],
  )

  const listaMasVendidos = useMemo(() => masVendidos.datos?.items || [], [masVendidos.datos])
  const maxUnidades = useMemo(
    () => Math.max(...listaMasVendidos.map((item) => Number(item.total_unidades || 0)), 1),
    [listaMasVendidos],
  )

  if (cargandoInicial) return <Spinner texto="Cargando estadísticas..." />

  return (
    <section className="main-admin" id="main-estadisticas">
      <header className="header-admin">
        <h1 className="h1-admin">Estadísticas</h1>
      </header>

      <KpisEstadisticas
        totalUltimoMes={totalUltimoMes}
        ventas={ventas}
        listaVentas={listaVentas}
        ultimoMesGanancia={ultimoMesGanancia}
        ganancias={ganancias}
        datosPromedio={promedio.datos}
        promedio={promedio}
        productosVencidosUnicos={productosVencidosUnicos}
        vencidos={vencidos}
        listaVencidos={listaVencidos}
      />

      <section className="estadisticas-grid">
        <GraficoVentasMes
          ventas={ventas}
          diasConVentas={diasConVentas}
          maxDia={maxDia}
        />

        <GraficoGananciasMes
          ganancias={ganancias}
          listaGanancias={listaGanancias}
        />

        <RankingMasVendidos
          masVendidos={masVendidos}
          listaMasVendidos={listaMasVendidos}
          maxUnidades={maxUnidades}
          mes={mes}
          onMesChange={setMes}
        />

        <TablaProductosVencidos
          vencidos={vencidos}
          listaVencidos={listaVencidos}
        />
      </section>
    </section>
  )
}

export default EstadisticasPage
