import { useOutletContext } from 'react-router';
import TarjetaProducto from '../../TarjetaProducto';
import { useProductos } from '../../../shared/hooks/useProductos';
import '../../../styles/card-producto.css';

function ProductosDestacados() {
  const { manejarAgregarAlCarrito } = useOutletContext();
  const { productos, cargando } = useProductos('/productosDestacados.json');

  return (
    <section id="section-prodDest">
      <h2 className="titulo-h2">Productos Destacados</h2>
      
      <section id="sec-prod-dest" className="sec-prod-dest">
        
        {cargando ? (<p>Cargando catálogo...</p>) 
        : productos.length === 0 ? (<p>No hay productos disponibles por el momento.</p>) 
        : (productos.map((prod) => (
            <TarjetaProducto 
              key={prod.id} 
              producto={prod} 
              onAgregar={manejarAgregarAlCarrito} 
            />
          ))
        )}
      </section>
    </section>
  );
}

export default ProductosDestacados;