import { Link } from "react-router";
import '../../styles/panelAdmin/navbarAdmin.css'
import Boton from '../../shared/components/Boton'
import {cerrarSesion} from '../../features/auth'
import { useNavigate } from "react-router";
import { useState } from "react";
import { FaBars, FaTimes } from 'react-icons/fa';

function NavBarAdmin({enlaces}){

    const [menuAbierto, setMenuAbierto] = useState(false);
    const toggleMenu = () => setMenuAbierto(!menuAbierto);
    const cerrarMenu = () => setMenuAbierto(false);
    const navigate = useNavigate();
    

    const handleCerrarSesion = () => {
        cerrarSesion(); 
        navigate('/login'); 
    };

    return(<>
    

        <button className="btn-hamburguesa-admin" onClick={toggleMenu} aria-label="Abrir menú de administración">
            <FaBars />
        </button>
    
        <div className={`menu-overlay ${menuAbierto ? 'activo' : ''}`} onClick={cerrarMenu}></div>
        
        
        <header className={`sidebar-admin ${menuAbierto ? 'abierto' : ''}`} id="sidebar-admin">
        <nav className="nav-admin">

            <button className="btn-cerrar-admin" onClick={cerrarMenu} >
                        <FaTimes />
            </button>

            <h2 className="h2-admin">La <span id="Fe-h2-admin">Fe</span> · admin</h2>

            <p className="p-nav">GENERAL</p>
            <ul className="ul-nav-admin">
                {enlaces.map((enlace) => (
                    <li key={enlace.id} className="li-nav">
                        <Link className="link-admin" to={enlace.destino}>
                            {enlace.texto}
                        </Link>
                    </li>
                ))}
            </ul>
            <p className="p-nav" id="p-cuenta-nav">CUENTA</p>
            <ul className="ul-nav-admin">
                <li className="li-nav">
                    <Link className="a-nav-admin" to="/administrador/configuracion">
                        Configuración
                    </Link> 
                </li>
                <li className="li-nav">
                    <Boton className="btn-CerrarSesion" onClick={handleCerrarSesion}>
                        Cerrar Sesion
                    </Boton>
                </li>
            </ul>
        </nav>
    </header>
    </>
    )
}
export default NavBarAdmin;