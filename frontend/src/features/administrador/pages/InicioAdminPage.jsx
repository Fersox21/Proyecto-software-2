import { Link } from 'react-router'
import '../../../styles/panelAdmin/inicioAdmin.css'

const ACCESOS_RAPIDOS = [
  { titulo: 'Productos', descripcion: 'Gestionar catálogo, precios y stock', destino: '/administrador/productos' },
  { titulo: 'Pedidos', descripcion: 'Revisar y aprobar pedidos pendientes', destino: '/administrador/pedidos' },
  { titulo: 'Ventas', descripcion: 'Consultar historial de ventas', destino: '/administrador/ventas' },
  { titulo: 'Lotes', descripcion: 'Controlar ingresos y mercadería', destino: '/administrador/lotes' },
  { titulo: 'Estadísticas', descripcion: 'Ver métricas del negocio', destino: '/administrador/estadisticas' },
  { titulo: 'Vencimientos', descripcion: 'Monitorear productos próximos a vencer', destino: '/administrador/vencimientos' },
]

function InicioAdminPage() {
  return (
    <section className="main-admin" id="main-inicio-admin">
      <header className="header-admin">
        <div>
          <h1 className="h1-admin">Panel de Administrador</h1>
          <p className="inicio-admin-subtitulo">Bienvenido</p>
        </div>
      </header>

      <div className="inicio-admin-grilla">
        {ACCESOS_RAPIDOS.map((acceso) => (
          <Link key={acceso.destino} to={acceso.destino} className="inicio-admin-tarjeta">
            <h2 className="inicio-admin-tarjeta-titulo">{acceso.titulo}</h2>
            <p className="inicio-admin-tarjeta-desc">{acceso.descripcion}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default InicioAdminPage
