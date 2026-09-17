import { NavLink, useLocation } from 'react-router'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaRegClock } from "react-icons/fa";
import '../../styles/navbar.css'

function NavBar({enlaces}){
    const location = useLocation();
    const esHome = location.pathname === '/';

    return (<>
        <header className={esHome ? "sidebar-home" : "sidebar"}>
            <div className="topbar">
                <span className="topbar-item">
                    <FaRegClock />
                    Lun a Vie 8:00–16:00 · Sáb 9:00–13:00
                </span>
                <div className="topbar-contacto">
                    <a className="topbar-item" href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                        <FaMapMarkerAlt /> Juan Gilberto Funes 460, San Luis
                    </a>
                    <a href="mailto:info@lafe.com" className="topbar-item">
                        <FaEnvelope /> info@lafe.com
                    </a>
                    <a href="https://wa.me/5492664238128" className="topbar-item" target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp /> +54 9 2664 23-8128
                    </a>
                </div>
            </div>

            <div className={esHome ? "imagen-banner" : "navbar-modificado"}>
                <nav aria-label="Navegación principal">

                    <NavLink className="a-logo" to="/">
                    La<span className="fe-logo">Fe</span> Distribuidora
                    </NavLink>

                    <ul className="ul-nav">
                    {enlaces.map((enlace) => (
                        <li key={enlace.id}>
                        <NavLink className="a-nav" to={enlace.destino}>
                            {enlace.texto}
                        </NavLink>
                        </li>
                    ))}
                    </ul>
                </nav>

                {esHome && (
                    <div id="div-banner-general">
                        <h2>LAFE Distribuidora</h2>
                        <div className="imagen-banner-texto">
                            <h1>Insumos de calidad para tu panaderia</h1>
                            <p>Acompañamos el cremiento de tu negocio con stock garantizado</p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    </>);
}

export default NavBar;