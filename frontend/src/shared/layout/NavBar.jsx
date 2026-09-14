import { link } from 'react-router'

function NavBar({enlaces}){
    return (<>
        <header class="sidebar-home">
            <div className="topbar">
                <span className="topbar-item">
                    <i className="far fa-clock"></i>
                    Lun a Vie 8:00–16:00 · Sáb 9:00–13:00
                </span>
                <div className="topbar-contacto">
                    <a className="topbar-item" href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-map-marker-alt"></i> Juan Gilberto Funes 460, San Luis
                    </a>
                    <a href="mailto:info@lafe.com" className="topbar-item">
                        <i className="far fa-envelope"></i> info@lafe.com
                    </a>
                    <a href="https://wa.me/5492664238128" className="topbar-item" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp"></i> +54 9 2664 23-8128
                    </a>
                </div>
            </div>

            <div className="imagen-banner">
                <nav aria-label="Navegación principal">
                    <a className="a-logo" href="index.html">
                        La<span className="fe-logo">Fe</span> Distribuidora
                    </a>
                    <ul className="ul-nav">
                        {enlaces.map((enlace) => (
                            <li>
                                <a className="a-nav" key={enlace.id} href={enlace.destino} aria-current="page">{enlace.texto}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div id="div-banner-general">
                    <h2>LAFE Distribuidora</h2>
                        <div className="imagen-banner-texto">
                            <h1>Insumos de calidad para tu panaderia</h1>
                            <p>Acompañamos el cremiento de tu negocio con stock garantizado</p>
                        </div>
                    </div>
                </div>
        </header>
    </>);
}

export default NavBar;