// import '../../../styles/panelAdmin/adminProductos.css'
import { obtenerProductos } from "../services/productosServices";
import { useFetch } from '../../../shared/hooks/useFetch'
import Spinner from '../../../shared/components/Spinner'
import MensajeVacio from '../../../shared/components/MensajeVacio'


function AdministradorPage() {

    const { datos: productos, cargando, error } = useFetch(obtenerProductos)


    if (cargando) return <Spinner texto="Cargando catálogo..." />
    if (error) return <MensajeVacio titulo="No pudimos cargar el catálogo" texto={error.message} />

return(<>
    <section className="main-admin" id="main-admin">
        <header className="header-admin">
            <h1 className="h1-admin">Productos</h1>
            <button className="agregar-prod">+ Agregar producto</button>
        </header>
        <section id="sec-prod-admin" className="sec-prod-admin" aria-live="polite">
            <table className="tabla-prod-admin">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                        <th>Acciones</th>
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
                                <td className="col-admin">
                                </td>
                                <td className="col-admin col-acciones">
                                    <button>Editar</button>
                                </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="tabla-admin-pie">
                <span id="info-pag">Mostrando 0–0 de 0</span>
                <div className="control-pag">
                    <button type="button" id="anterior-pag">‹</button>
                    <span id="nums-pag"></span>
                    <button type="button" id="siguiente-pag">›</button>
                </div>
            </div>
        </section>
    </section>
</>)

}

export default AdministradorPage;