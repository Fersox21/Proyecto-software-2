import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaRegClock, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import iconoCarrito from '../../assets/Items/iconoCarrito.svg';
import '../../styles/navbar.css';

function NavBar({enlaces, cantidadCarrito}){
    const location = useLocation();
    const esHome = location.pathname === '/';
    const [menuAbierto, setMenuAbierto] = useState(false);
    const toggleMenu = () => setMenuAbierto(!menuAbierto);
    const cerrarMenu = () => setMenuAbierto(false);

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

                    <button 
                        className="btn-hamburguesa" 
                        onClick={toggleMenu} 
                        aria-label="Alternar menú"
                    >
                        <FaBars />
                    </button>

                    {!menuAbierto && (
                        <NavLink className="a-logo" to="/">
                            La<span className="fe-logo">Fe</span> Distribuidora
                        </NavLink>
                    )}

                    <div className={`menu-overlay ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>

                    <ul className={`ul-nav ${menuAbierto ? 'abierto' : ''}`}>
                        <button className="btn-cerrar-menu" onClick={cerrarMenu} aria-label="Cerrar menú">
                            <FaTimes />
                        </button>

                        {menuAbierto && (
                            <>
                                <li>
                                    <NavLink className="a-logo" to="/">
                                        La<span className="fe-logo">Fe</span> Distribuidora
                                    </NavLink>
                                </li>
                                <hr className="divisor-menu" />
                            </>
                        )}
                        
                        {enlaces.map((enlace) => (
                            <li key={enlace.id}>
                                <NavLink className="a-nav" to={enlace.destino} end={enlace.destino === '/'} onClick={cerrarMenu}>
                                    {enlace.texto}
                                </NavLink>
                            </li>
                        ))}

                        <li className="carrito-desktop">
                            <NavLink className="a-nav" to="/carrito" onClick={cerrarMenu}>
                                <img  src={iconoCarrito} alt='iconoCarrito'/>
                                {cantidadCarrito}
                            </NavLink>
                        </li>
                    </ul>

                    <NavLink className="a-nav carrito-mobile" to="/carrito" onClick={cerrarMenu}>
                        <img  src={iconoCarrito} alt='iconoCarrito'/>
                        {cantidadCarrito}
                    </NavLink>
                </nav>

                {esHome && (
                    <>
                        <div id="div-banner-general">
                            <h2>LAFE Distribuidora</h2>
                            <div className="imagen-banner-texto">
                                <h1>Insumos de calidad para tu panaderia</h1>
                                <p>Acompañamos el cremiento de tu negocio con stock garantizado</p>
                            </div>
                        </div>
                        <div className="indicador-scroll">
                            <FaChevronDown className="flecha-animada" />
                        </div>
                    </>
                )}
            </div>
        </header>
    </>);
}

export default NavBar;