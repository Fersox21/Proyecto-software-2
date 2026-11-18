import { NavLink, useNavigate } from "react-router";
import '../../styles/panelAdmin/navbarAdmin.css';
import { cerrarSesion } from '../../features/auth';
import { useState } from "react";
import {
    LuBoxes,
    LuCalendarClock,
    LuChartBar,
    LuChevronRight,
    LuFileText,
    LuFolder,
    LuGlobe,
    LuHouse,
    LuLayoutGrid,
    LuLogOut,
    LuMenu,
    LuPackage,
    LuReceipt,
    LuSettings,
    LuShoppingCart,
    LuUsers,
    LuX,
} from 'react-icons/lu';

const ICONOS_ENLACES = {
    '/administrador': LuHouse,
    '/administrador/productos': LuPackage,
    '/catalogo': LuLayoutGrid,
    '/administrador/estadisticas': LuChartBar,
    '/administrador/lotes': LuBoxes,
    '/administrador/proveedores': LuUsers,
    '/administrador/vencimientos': LuCalendarClock,
    '/administrador/pedidos': LuShoppingCart,
    '/administrador/ventas': LuReceipt,
    '/administrador/ordenes-compra': LuFileText,
    '/administrador/categorias': LuFolder,
    '/': LuGlobe,
};

function NavBarAdmin({ enlaces }) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const toggleMenu = () => setMenuAbierto((prev) => !prev);
    const cerrarMenu = () => setMenuAbierto(false);
    const navigate = useNavigate();

    const handleCerrarSesion = () => {
        cerrarMenu();
        cerrarSesion();
        navigate('/login');
    };

    const claseEnlace = ({ isActive }) =>
        `link-admin dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white${isActive ? ' activo dark:text-white' : ''}`;

    return (
        <>
            <button
                type="button"
                className="btn-hamburguesa-admin dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={toggleMenu}
                aria-label="Abrir menú de administración"
                aria-expanded={menuAbierto}
            >
                <LuMenu aria-hidden="true" />
            </button>

            <div className={`menu-overlay ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>

            <header
                className={`sidebar-admin dark:bg-slate-900 border-r dark:border-slate-800 ${menuAbierto ? 'abierto' : ''}`}
                id="sidebar-admin"
            >
                <nav className="nav-admin dark:bg-slate-900" aria-label="Navegación de administración">
                    <div className="sidebar-marca-admin dark:border-slate-700">
                        <NavLink to="/administrador" end className="marca-admin-link" onClick={cerrarMenu}>
                            <span className="marca-admin-lafe dark:text-white">LaFe</span>
                            <span className="marca-admin-distri dark:text-slate-200">DISTRIBUIDORA</span>
                        </NavLink>
                        <button
                            type="button"
                            className="btn-cerrar-admin dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            onClick={cerrarMenu}
                            aria-label="Cerrar menú de administración"
                        >
                            <LuX aria-hidden="true" />
                        </button>
                    </div>

                    <p className="p-nav dark:text-slate-400">GENERAL</p>
                    <ul className="ul-nav-admin">
                        {enlaces.map((enlace) => {
                            const IconoEnlace = ICONOS_ENLACES[enlace.destino] || LuChevronRight;
                            return (
                                <li key={enlace.id} className="li-nav">
                                    <NavLink
                                        className={claseEnlace}
                                        to={enlace.destino}
                                        end={enlace.destino === '/administrador' || enlace.destino === '/'}
                                        onClick={cerrarMenu}
                                    >
                                        <span className="link-admin-contenido">
                                            <IconoEnlace className="icono-nav-admin" aria-hidden="true" />
                                            <span>{enlace.texto}</span>
                                        </span>
                                        <LuChevronRight className="icono-flecha-admin" aria-hidden="true" />
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>

                    <p className="p-nav dark:text-slate-400" id="p-cuenta-nav">CUENTA</p>
                    <ul className="ul-nav-admin">
                        <li className="li-nav">
                            <NavLink
                                className={({ isActive }) =>
                                    `a-nav-admin dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white${isActive ? ' activo dark:text-white' : ''}`
                                }
                                to="/administrador/configuracion"
                                onClick={cerrarMenu}
                            >
                                <span className="link-admin-contenido">
                                    <LuSettings className="icono-nav-admin" aria-hidden="true" />
                                    <span>Configuración</span>
                                </span>
                                <LuChevronRight className="icono-flecha-admin" aria-hidden="true" />
                            </NavLink>
                        </li>
                        <li className="li-nav li-nav-sesion">
                            <button
                                type="button"
                                className="btn-CerrarSesion dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                                onClick={handleCerrarSesion}
                            >
                                <LuLogOut className="icono-nav-admin" aria-hidden="true" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
}

export default NavBarAdmin;
