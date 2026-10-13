import { obtenerVentas } from '../services/ventasService';
import { useFetch } from '../../../shared/hooks/useFetch';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';

function VentasPage(){

    const { datos: ventas, cargando, error } = useFetch(obtenerVentas)


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
                    {ventas.map((venta)=> (
                        <tr key={venta.id}>
                                <td className="col-admin col-fecha">{venta.fecha}</td>
                                <td className="col-admin col-total">{venta.total}</td>
                                <td className="col-admin col-producto">{venta.producto_id}</td>
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