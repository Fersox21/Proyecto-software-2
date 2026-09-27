import { Link } from 'react-router'
import { TarjetaProducto } from '../../catalogo'

function ProductosDestacados({ productos, onAgregar }) {
  return (
    <section aria-labelledby="titulo-destacados">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <h2 id="titulo-destacados" className="h3 mb-0">
          Destacados de la temporada
        </h2>
        <Link to="/catalogo" className="link-dark">
          Ver todo el catálogo →
        </Link>
      </div>

      {/* CLASE 3 · Renderizar listas: key con el id del dato, nunca el índice */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
        {productos.map((producto) => (
          <div className="col" key={producto.id}>
            <TarjetaProducto producto={producto} onAgregar={onAgregar} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductosDestacados;
