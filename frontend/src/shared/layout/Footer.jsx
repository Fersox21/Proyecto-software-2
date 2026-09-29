import logo from '../../assets/Logo/Logo-Lafe.png';
import { NavLink } from 'react-router';
import '../../styles/footer.css'

function Footer(){
    return(<>
        <footer>
            <div className="footer-cuadro">
                <div className="footer-logo">

                    <NavLink className="footer-logo" to='/'>
                        <img src={logo} alt="logo"/>
                    </NavLink>
        
                    </div>

                    <div className="footer-catalogo">

                        <NavLink className="footer-catalogo" to='/catalogo'>
                        <h3><a href="catalogo.html">Productos</a></h3>
                        <a href="catalogo.html?categoria=harinas">harinas</a>
                        <a href="catalogo.html?categoria=pastas">pastas</a>
                        <a href="catalogo.html?categoria=lacteos">lacteos</a>
                        </NavLink>
                        
                    </div>
                    
                    <div className="footer-preguntas">

                        <NavLink className="footer-preguntas" to='/preguntasFrecuentes'>
                            <h3>Preguntas frecuentes</h3>
                            <a href="preguntas.html">Zona de envios</a>
                            <a href="preguntas.html">Medios de pago</a>
                            <a href="preguntas.html">Minimo de compra</a>
                        </NavLink>

                        
                    </div>

                    <div className="footer-redes">
                        <h3>Redes sociales</h3>
                        <a href="https://www.instagram.com/insumos.lafe/?hl=es-la" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i> Instagram
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=100065429201528&locale=bg_BG#" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook"></i> Facebook
                        </a>
                        <a href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                           <i className="fas fa-map-marker-alt"></i> Encontranos
                        </a>
                    </div>

                    <div className="footer-interesa">

                        <NavLink className="footer-formulario" to='/realizarPedido'>
                            <h3>
                            <a href="formulario1.html">Realiza tu consulta</a>
                            </h3>
                        </NavLink>
                        
                    </div>

                    
                </div>
                <p>LaFe se reserva todos los derechos</p>
                <p>Copyright 2026</p>
                <NavLink className="Acceso-Admin" to="/administrador">
                        <p>Acceso Administrativo</p>    
                </NavLink>
            </footer>
    </>);
}

export default Footer;