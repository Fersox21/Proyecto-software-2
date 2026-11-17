import NavbarAdmin from './NavBarAdmin'
import '../../styles/panelAdmin/adminGeneral.css'
import { Outlet, ScrollRestoration } from 'react-router'; 


const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/administrador' },
  { id: 13, texto: 'Productos', destino: '/administrador/productos' },
  { id: 2, texto: 'Catálogo', destino: '/catalogo' },
  { id: 3, texto: 'Estadisticas', destino: '/administrador/estadisticas'},
  { id: 4, texto: 'Lotes', destino: '/administrador/lotes'},
  { id: 5, texto: 'Promociones', destino: '/administrador/promociones'},
  { id: 6, texto: 'Proveedores', destino: '/administrador/proveedores'},
  { id: 7, texto: 'Vencimientos', destino: '/administrador/vencimientos'},
  { id: 8, texto: 'Pedidos', destino: '/administrador/pedidos'},
  { id: 9, texto: 'Ventas', destino: '/administrador/ventas'},
  { id: 11, texto: 'Órdenes de compra', destino: '/administrador/ordenes-compra'},
  { id: 12, texto: 'Categorías', destino: '/administrador/categorias'},
  { id: 10, texto: 'Pagina Principal', destino: '/'},

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