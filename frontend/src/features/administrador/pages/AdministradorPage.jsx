
import { obtenerProductos } from "../services/productosServices";
import { useFetch } from '../../../shared/hooks/useFetch';
import { formatearPrecio, obtenerPreciosProducto } from '../../../shared/utils/formato';
import Spinner from '../../../shared/components/Spinner';
import MensajeVacio from '../../../shared/components/MensajeVacio';


function AdministradorPage() {

    const { datos: productos, cargando, error } = useFetch(obtenerProductos)

    function calcularEstado(stock) {
        if (stock < 10) return "Stock bajo"
        if (stock >= 10 && stock <= 20) return "Stock suficiente"
        return "Stock alto"
    }

    if (cargando) return <Spinner texto="Cargando productos..." />
    if (error) return <MensajeVacio titulo="No pudimos cargar los productos" texto={error.message} />

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
                        <th>Marca</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Precio venta</th>
                        <th>Precio costo</th>
                        <th>Stock</th>
                        <th>En promocion</th>
                        <th>Descuento</th>
                        <th>Precio con promo</th>
                        <th>Estado</th>
                        <th>Destacado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody id="tabla-admin-body">
                    {productos.map((prod)=> {
                        const { enPromocion, descuento, precioVigente } = obtenerPreciosProducto(prod)
                        return (
                        <tr key={prod.id}>
                                <td className="col-admin col-nombre">{prod.nombre}</td>
                                <td className="col-admin">{prod.marca}</td>
                                <td className="col-admin col-descripcion">{prod.peso}</td>
                                <td className="col-admin col-categoria">{prod.categoria}</td>
                                <td className="col-admin col-precio">{formatearPrecio(prod.precioVenta)}</td>
                                <td className="col-admin col-precio">{formatearPrecio(prod.precioCosto)}</td>
                                <td className="col-admin col-stock">{prod.stock}</td>
                                <td className="col-admin">{enPromocion ? 'Si' : 'No' }</td>
                                <td className="col-admin">{enPromocion ? `-${descuento}%` : '—'}</td>
                                <td className="col-admin">{enPromocion ? formatearPrecio(precioVigente) : '—'}</td>
                                <td className="col-admin">{calcularEstado(prod.stock)}</td>
                                <td className="col-admin">{prod.destacado ? 'Si' : 'No' }</td>
                                <td className="col-admin col-acciones">
                                    <button>Editar</button>
                                </td>
                        </tr>
                        )
                    })}
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