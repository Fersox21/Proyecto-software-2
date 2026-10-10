import { obtenerVentas } from '../services/ventasService';
import { useFetch } from '../../../shared/hooks/useFetch';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';

function VentasPage(){

    const { datos: productos, cargando, error } = useFetch(obtenerVentas)


    if (cargando) return <Spinner texto="Cargando ventas..." />
    if (error) return <MensajeVacio titulo="No pudimos cargar las ventas" texto={error.message} />

    return(<>
        
            <section id="sec-ventas-admin" className="sec-ventas-admin" aria-live="polite">
            <table className="tabla-ventas-admin">
                <thead>
                    <tr>
                        <tr>Numero</tr>
                        <tr>Fecha</tr>
                        <tr>Total</tr>
                        <tr></tr>
                    </tr>
                </thead>

                <tbody id="tabla-admin-body">
                    {productos.map((prod)=> (
                        <tr key={prod.id}>
                                <td className="col-admin col-nombre">{prod.nombre}</td>
                                <td className="col-admin col-descripcion">{prod.descripcion}</td>
                                <td className="col-admin col-categoria">{prod.categoria}</td>
                                <td className="col-admin col-precio">${prod.precio}</td>
                                <td className="col-admin col-stock">{prod.stock}</td>
                                <td className="col-admin">{calcularEstado(prod.stock)}</td>
                                <td className="col-admin col-acciones">
                                    <button>Editar</button>
                                </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>

        


        </>
    )
}

export default VentasPage;