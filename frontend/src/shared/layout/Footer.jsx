import logo from '/Logo-Lafe.svg';
import { NavLink } from 'react-router';
import '../../styles/footer.css'; 
import { FiLock } from 'react-icons/fi';

function Footer() {
  return (
    <footer>
      <div className="footer-cuadro">
        <div className="footer-logo">
          <NavLink to="/">
            <img src={logo} alt="Logo LaFe" />
          </NavLink>
          <p className="footer-descripcion">
            Insumos de panadería y pastelería para negocios de San Luis. <span className="footer-direccion"> Av. Juan Gilberto Funes 460, San Luis.</span>
          </p>
        </div>

        <div className="footer-catalogo">
          <h6>
            <NavLink className="footer-titulos" to="/catalogo">PRODUCTOS</NavLink>
          </h6>
          <NavLink className="footer-secciones" to="/catalogo?categoria=harinas">Harinas</NavLink>
          <NavLink className="footer-secciones" to="/catalogo?categoria=pastas">Pastas</NavLink>
          <NavLink className="footer-secciones" to="/catalogo?categoria=lacteos">Lacteos</NavLink>
        </div>

        <div className="footer-preguntas">
          <h6>
            <NavLink className="footer-titulos" to="/preguntasFrecuentes">PREGUNTAS FRECUENTES</NavLink>
          </h6>
          <NavLink className="footer-secciones" to="/preguntasFrecuentes">Zona de envíos</NavLink>
          <NavLink className="footer-secciones" to="/preguntasFrecuentes">Medios de pago</NavLink>
          <NavLink className="footer-secciones" to="/preguntasFrecuentes">Mínimo de compra</NavLink>
        </div>

        <div className="footer-redes">
          <h6 className="footer-titulos">CONTACTANOS</h6>
          <a
            href="https://www.instagram.com/insumos.lafe/?hl=es-la"
            className="footer-secciones"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram"></i> Instagram
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=100065429201528&locale=bg_BG#"
            className="footer-secciones"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook"></i> Facebook
          </a>
          <a
            href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7"
            className="footer-secciones"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-map-marker-alt"></i> Encontranos
          </a>
        </div>
      </div>

      {/* Contenedor que agrupa la fila inferior en línea horizontal */}
      <div className="derechos">
        <p className="copyright">© 2026 LaFe Distribuidora. Todos los derechos reservados.</p>
        <NavLink className="acceso-admin" to="/login">
          <FiLock/> Acceso Administrativo
        </NavLink>
      </div>
    </footer>
  );
}

export default Footer;