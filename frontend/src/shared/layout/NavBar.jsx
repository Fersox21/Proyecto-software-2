import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaRegClock, FaChevronDown, FaBars, FaTimes, FaArrowRight } from 'react-icons/fa';
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
                <div className="topbar-item-cont">
                    <span className="topbar-item topbar-texto">
                        <FaRegClock /> <span className="topbar-texto">Lun a Vie 8:00–16:00 · Sáb 9:00–13:00</span>
                    </span>
                    <a className="topbar-item" href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                        <FaMapMarkerAlt /> <span className="topbar-texto">Juan Gilberto Funes 460, San Luis</span>
                    </a>
                </div>
                <div className="topbar-item-cont">
                    <a href="mailto:info@lafe.com" className="topbar-item">
                        <FaEnvelope /> <span className="topbar-texto">info@lafe.com</span>
                    </a>
                    <a href="https://wa.me/5492664238128" className="topbar-item" target="_blank" rel="noopener noreferrer">
                        <FaWhatsapp /><span className="topbar-texto">+54 9 2664 23-8128</span>
                    </a>
                </div>
            </div>

            <nav aria-label="Navegación principal">
                <button
                    className="btn-hamburguesa" 
                    onClick={toggleMenu} 
                    aria-label="Alternar menú"
                >
                    <FaBars />
                </button>

                {!menuAbierto && (
                        <NavLink className="titulo-header a-logo" to="/">
                            <img className="logo" src="/Logo-Lafe.svg"/>
                            <div className="texto-titulo-header"><span className="lafe">LaFe</span> <span className="distribuidora">DISTRIBUIDORA</span></div>
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
                                <NavLink className="a-logo logo" to="/">
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
                </ul>

                <div className="carrito-desktop">
                    <NavLink className="a-nav" to="/carrito" onClick={cerrarMenu}>
                        <img  src={iconoCarrito} alt='iconoCarrito'/>
                        <span className="num-carrito">{cantidadCarrito}</span>
                    </NavLink>
                </div>

                <NavLink className="a-nav carrito-mobile" to="/carrito" onClick={cerrarMenu}>
                    <img src={iconoCarrito} alt='iconoCarrito'/>
                    {cantidadCarrito}
                </NavLink>
            </nav>

            {esHome && (
                <div className="imagen-banner">
                    <div className="gradiente-general"></div>
                    <div className="div-banner">
                        <div id="div-banner-general">
                            <p className="subtitulo-banner">DISTRIBUIDORA MAYORISTA · SAN LUIS</p>
                            <div className="imagen-banner-texto">
                                <h1 className="titulo-banner">Insumos de calidad <br/>para tu <span className="destacado-banner">panadería</span></h1>
                                <p>Acompañamos el cremiento de tu negocio con stock garantizado, <br/> las mejores marcas y reparto directo a tu puerta.</p>
                            </div>
                        </div>
                        <Link to={'/catalogo'} className="catalogo-banner">Ver catálogo <FaArrowRight/></Link>
                        <div className="indicador-scroll">
                            <FaChevronDown className="flecha-animada" />
                        </div>
                    </div>
                </div>
            )}
        </header>
    </>);
}

export default NavBar;