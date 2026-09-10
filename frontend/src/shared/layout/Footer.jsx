function Footer(){
    return(<>
        <footer>
            <div className="footer-cuadro">
                <div className="footer-logo">
                    <a href="index.html">
                        <img src="frontend\src\assets\Logo\Logo-Lafe.png" alt="logo"/>
                    </a>
                    </div>

                    <div className="footer-catalogo">
                        <h3><a href="catalogo.html">Productos</a></h3>
                        <a href="catalogo.html?categoria=harinas">harinas</a>
                        <a href="catalogo.html?categoria=pastas">pastas</a>
                        <a href="catalogo.html?categoria=lacteos">lacteos</a>
                    </div>
                    
                    <div className="footer-preguntas">
                        <h3><a href="preguntas.html">Preguntas frecuentes</a></h3>
                        <a href="preguntas.html">Zona de envios</a>
                        <a href="preguntas.html">Medios de pago</a>
                        <a href="preguntas.html">Minimo de compra</a>
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
                            <a href="formulario1.html">Realiza tu consulta</a>
                        </h3>
                    </div>

                    
                </div>
                <p>LaFe se reserva todos los derechos</p>
                <p>Copyright 2026</p>
                <a href="./adminProductos.html">Acceso administrativo</a>
            </footer>
    </>);
}

export default Footer;