import BienvenidosHome from "./Home/BienvenidosHome";
import ProductosDestacados from "./Home/ProductosDestacados";
import HorariosYUbicacion from "./Home/HorariosYUbicacion";
import Contactos from "./Home/Contactos";
import Marcas from "./Home/Marcas";

function Home(){
    return (<>
        <BienvenidosHome />
        <ProductosDestacados />
        <HorariosYUbicacion />
        <Contactos />
        <Marcas />
    </>);
}

export default Home;