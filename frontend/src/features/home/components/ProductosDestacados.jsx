import { Link } from 'react-router'
import { TarjetaProducto } from '../../catalogo'
import { FaArrowRight } from 'react-icons/fa';

function ProductosDestacados({ productos, onAgregar }) {
  return (
    <div className="destacados-seccion">
      <section aria-labelledby="titulo-destacados" className="container my-5">
        <p className="destacados-subtitulo">CATÁLOGO</p>
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-5">
          <h2 className="destacados-titulo">
            Destacados de la temporada
          </h2>
          <Link to="/catalogo" className="text-decoration-none destacados-catalogo">
            Ver todo el catálogo <FaArrowRight />
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {productos.map((producto) => (
            <div className="col" key={producto.id}>
              <TarjetaProducto producto={producto} onAgregar={onAgregar} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductosDestacados;
