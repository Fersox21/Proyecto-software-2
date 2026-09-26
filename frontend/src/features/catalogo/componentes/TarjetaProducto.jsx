function TarjetaProducto({ producto, onAgregar }) {
  return (
    <article className="card">
      <img className="card-img" src={producto.imagen} alt={producto.nombre} />
      <h3 className="card-nom">{producto.nombre}</h3>
      <p className="card-desc">{producto.descripcion}</p>
      <p className="card-prec">${producto.precio}</p>
      <button 
        className="card-butt" 
        onClick={() => onAgregar(producto)}
      >
        Agregar al carrito
      </button>
    </article>
  );
}

export default TarjetaProducto;