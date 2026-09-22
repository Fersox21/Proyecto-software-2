import Navbar from './NavBar';
import Footer from './Footer';

const enlacesAdmin = [
  { id: 1, texto: 'Inicio', destino: '/administrador' },
  { id: 2, texto: 'Catálogo', destino: '/administrador/catalogo' },
  { id: 3, texto: 'Preguntas frecuentes', destino: '/administrador/preguntasFrecuentes' },
];

function LayoutPrivado(){
    return(
        <>
        
    <Navbar enlaces={enlacesAdmin} />
    <main></main>
    <Footer />

        </>
    )
}

export default LayoutPrivado;