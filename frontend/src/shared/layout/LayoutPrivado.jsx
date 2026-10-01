import NavbarAdmin from './NavBarAdmin';
import Footer from './Footer';
import { Outlet, ScrollRestoration } from 'react-router'; 


const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/administrador' },
  { id: 2, texto: 'Catálogo', destino: '/administrador/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/administrador/preguntasFrecuentes' },
];

function LayoutPrivado(){
    return(
        <>
        
    <NavbarAdmin enlaces={enlacesAdmin}/>
    <main className='Main-content'>
        <Outlet />
    </main>
    <Footer />
      <ScrollRestoration />

        </>
    )
}

export default LayoutPrivado;