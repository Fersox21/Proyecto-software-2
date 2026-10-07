import NavbarAdmin from './NavBarAdmin'
import '../../styles/panelAdmin/adminGeneral.css'
import { Outlet, ScrollRestoration } from 'react-router'; 


const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Vencimiento', destino: '/vencimiento'}
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