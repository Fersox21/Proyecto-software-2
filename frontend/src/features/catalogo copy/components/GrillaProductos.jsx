import TarjetaProducto from './TarjetaProducto'

function GrillaProductos({ productos, onAgregar }) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4 grilla-productos">
      {productos.map((producto) => (
        <div className="col" key={producto.id}>
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </div>
      ))}
    </div>
  )
}

export default GrillaProductos
