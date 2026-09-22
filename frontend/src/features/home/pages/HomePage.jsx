import BienvenidosHome from "../components/BienvenidosHome";
import ProductosDestacados from "../components/ProductosDestacados";
import HorariosYUbicacion from "../components/HorariosYUbicacion";
import Contactos from "../components/Contactos";
import Marcas from "../components/Marcas";

function HomePage(){
    return (<>
        <BienvenidosHome />
        {/*<ProductosDestacados />*/}
        <HorariosYUbicacion />
        <Contactos />
        <Marcas />
    </>);
}

export default HomePage;