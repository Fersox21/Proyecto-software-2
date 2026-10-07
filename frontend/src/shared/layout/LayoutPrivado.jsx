import NavbarAdmin from './NavBarAdmin'
import '../../styles/panelAdmin/adminGeneral.css'
import { Outlet, ScrollRestoration } from 'react-router'; 


const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/administrador' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Estadisticas', destino: 'administrador/estadisticas'},
  { id: 4, texto: 'Lotes', destino: 'administrador/estadisticas'},
  { id: 5, texto: 'Promociones', destino: 'administrador/estadisticas'},
  { id: 6, texto: 'Proveedores', destino: 'administrador/estadisticas'},
  { id: 7, texto: 'Vencimientos', destino: 'administrador/estadisticas'},
  { id: 8, texto: 'Ventas', destino: 'administrador/estadisticas'},
  { id: 9, texto: 'Pagina Principal', destino: '/'},

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