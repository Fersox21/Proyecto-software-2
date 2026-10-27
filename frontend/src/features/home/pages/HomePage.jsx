import BienvenidosHome from "../components/BienvenidosHome";
import ProductosDestacados from "../components/ProductosDestacados";
import HorariosYUbicacion from "../components/HorariosYUbicacion";
import CarruselMarcas from "../components/CarruselMarcas";
import { useOutletContext } from "react-router";
import { useFetch } from '../../../shared/hooks/useFetch'
import { obtenerDestacados } from '../../catalogo'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'

function HomePage(){
    const { agregarProducto } = useOutletContext()
    const { datos: destacados, cargando, error } = useFetch(obtenerDestacados)

    return (<>
        <BienvenidosHome />
        {cargando && <Spinner texto="Cargando productos destacados..." />}
        {error && <MensajeVacio titulo="No pudimos cargar los productos destacados" texto={error.message} />}
        {destacados && <ProductosDestacados productos={destacados} onAgregar={agregarProducto} />}
        <CarruselMarcas />
        <HorariosYUbicacion /> 
    </>);
}

export default HomePage;