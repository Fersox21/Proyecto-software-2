import logo from '../../assets/Logo/Logo-Lafe.png';
import { NavLink } from 'react-router';
import '../../styles/footer.css'; 

function Footer() {
  return (
    <footer>
      <div className="footer-cuadro">
        <div className="footer-logo">
          <NavLink to="/">
            <img src={logo} alt="Logo LaFe" />
          </NavLink>
        </div>

        <div className="footer-catalogo">
          <h3>
            <NavLink to="/catalogo">Productos</NavLink>
          </h3>
          <NavLink to="/catalogo?categoria=harinas">harinas</NavLink>
          <NavLink to="/catalogo?categoria=pastas">pastas</NavLink>
          <NavLink to="/catalogo?categoria=lacteos">lacteos</NavLink>
        </div>

        <div className="footer-preguntas">
          <h3>
            <NavLink to="/preguntasFrecuentes">Preguntas frecuentes</NavLink>
          </h3>
          <NavLink to="/preguntasFrecuentes">Zona de envíos</NavLink>
          <NavLink to="/preguntasFrecuentes">Medios de pago</NavLink>
          <NavLink to="/preguntasFrecuentes">Mínimo de compra</NavLink>
        </div>

        <div className="footer-redes">
          <h3>Redes sociales</h3>
          <a
            href="https://www.instagram.com/insumos.lafe/?hl=es-la"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram"></i> Instagram
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100065429201528&locale=bg_BG#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook"></i> Facebook
          </a>
          <a
            href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-map-marker-alt"></i> Encontranos
          </a>
        </div>

        <div className="footer-interesa">
          <NavLink className="footer-formulario" to="/realizarPedido">
            <h3>Realiza tu consulta</h3>
          </NavLink>
        </div>
      </div>

      {/* Contenedor que agrupa la fila inferior en línea horizontal */}
      <div className="derechos">
        <p>LaFe se reserva todos los derechos</p>
        <p>Copyright 2026</p>
        <NavLink className="Acceso-Admin" to="/login">
          Acceso Administrativo
        </NavLink>
      </div>
    </footer>
  );
}

export default Footer;