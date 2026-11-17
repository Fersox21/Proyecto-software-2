import { Link } from 'react-router';
import {
  LuClock,
  LuPackage,
  LuReceipt,
  LuShoppingCart,
  LuTrendingUp,
  LuTruck,
} from 'react-icons/lu';
import '../../../styles/panelAdmin/inicioAdmin.css';

const ACCESOS_RAPIDOS = [
  {
    titulo: 'Productos',
    descripcion: 'Gestionar catálogo, precios y stock',
    destino: '/administrador/productos',
    Icono: LuPackage,
    variante: 'azul',
  },
  {
    titulo: 'Pedidos',
    descripcion: 'Revisar y aprobar pedidos pendientes',
    destino: '/administrador/pedidos',
    Icono: LuShoppingCart,
    variante: 'bordo',
  },
  {
    titulo: 'Ventas',
    descripcion: 'Consultar historial de ventas',
    destino: '/administrador/ventas',
    Icono: LuReceipt,
    variante: 'verde',
  },
  {
    titulo: 'Lotes',
    descripcion: 'Controlar ingresos y mercadería',
    destino: '/administrador/lotes',
    Icono: LuTruck,
    variante: 'azul',
  },
  {
    titulo: 'Estadísticas',
    descripcion: 'Ver métricas del negocio',
    destino: '/administrador/estadisticas',
    Icono: LuTrendingUp,
    variante: 'verde',
  },
  {
    titulo: 'Vencimientos',
    descripcion: 'Monitorear productos próximos a vencer',
    destino: '/administrador/vencimientos',
    Icono: LuClock,
    variante: 'bordo',
  },
];

function formatearFechaActual() {
  const fecha = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

function InicioAdminPage() {
  const fechaActual = formatearFechaActual();

  return (
    <section className="main-admin" id="main-inicio-admin">
      <header className="header-admin inicio-admin-header">
        <div>
          <h1 className="h1-admin inicio-admin-titulo">Panel de Administrador</h1>
          <p className="inicio-admin-subtitulo">
            Bienvenido, Administrador <span className="inicio-admin-separador" aria-hidden="true">·</span> <span className="inicio-admin-fecha">{fechaActual}</span>
          </p>
        </div>
      </header>

      <div className="inicio-admin-grilla">
        {ACCESOS_RAPIDOS.map(({ titulo, descripcion, destino, Icono, variante }) => (
          <Link key={destino} to={destino} className="inicio-admin-tarjeta">
            <div className={`inicio-admin-icono-circulo inicio-admin-icono-${variante}`} aria-hidden="true">
              <Icono size={22} />
            </div>
            <div className="inicio-admin-tarjeta-cuerpo">
              <h2 className="inicio-admin-tarjeta-titulo">{titulo}</h2>
              <p className="inicio-admin-tarjeta-desc">{descripcion}</p>
            </div>
            <span className="inicio-admin-tarjeta-accion">
              Acceder <span className="inicio-admin-flecha" aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default InicioAdminPage;
