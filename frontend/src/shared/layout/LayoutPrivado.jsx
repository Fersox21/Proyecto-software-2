import NavbarAdmin from './NavBarAdmin'
import Footer from './Footer'
import '../../styles/panelAdmin/adminProductos.css'

import { Outlet, ScrollRestoration } from 'react-router'; 


const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/administrador' },
  { id: 2, texto: 'Catálogo', destino: '/administrador/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/administrador/preguntasFrecuentes' },
];

function LayoutPrivado(){
    return(<>
    <div className='layout-admin-contenedor'>
            <NavbarAdmin enlaces={enlacesAdmin}/>

    <main className='layout-admin-principal'>
        <Outlet />
    </main>


      <ScrollRestoration />
    </div>
    

        </>
    )
}

export default LayoutPrivado;