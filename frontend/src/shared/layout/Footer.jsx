    import logo from '../../assets/Logo/Logo-Lafe.png';
    import { NavLink } from 'react-router';
    import { Link } from 'react-router';

    function Footer(){
        return(<>
            <footer>
                <div className="footer-cuadro">
                    <div className="footer-logo">
                        <Link to="/">
                            <img src={logo} alt="logo"/>
                        </Link>
                    </div>

                        <div className="footer-catalogo">
                            <h3><Link to="/catalogo">Productos</Link></h3>
                            <Link to="/catalogo?categoria=harinas">harinas</Link>
                            <Link to="/catalogo?categoria=pastas">pastas</Link>
                            <Link to="/catalogo?categoria=granos">granos</Link>
                        </div>
                        
                        <div className="footer-preguntas">
                            <h3><Link to="/preguntasFrecuentes">Preguntas frecuentes</Link></h3>
                            <Link to="/preguntasFrecuentes#zona-envios">Zona de envios</Link>
                            <Link to="/preguntasFrecuentes#medios-pago">Medios de pago</Link>
                            <Link to="/preguntasFrecuentes#minimo-compra">Minimo de compra</Link>
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
                            <h3>
                                <Link to="/realizarPedido">Realiza tu pedido</Link>
                            </h3>
                        </div>

                        
                    </div>

                    <div className="derechos">
                        <span>© 2026 LaFe Distribuidora. Todos los derechos reservados.</span>
                            <Link className="Acceso-Admin" to="/administrador">
                                Acceso Administrativo
                            </Link>
                    </div>

                </footer>
        </>);
    }

    export default Footer;