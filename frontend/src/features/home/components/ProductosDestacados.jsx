import { useState, useEffect } from 'react';

function ProductosDestacados() {
    return (<></>);
}

export default ProductosDestacados;

{/*
  const { agregarProducto } = useOutletContext()
 const { datos: productos, cargando, error } = useFetch(obtenerProductos)
 const filtros = useFiltros(productos)

 // Los hooks siempre van ANTES de cualquier return anticipado.
 if (cargando) return <Spinner texto="Cargando catálogo..." />
 if (error) return <MensajeVacio titulo="No pudimos cargar el catálogo" texto={error.message} />



  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Aquí simulamos pedirle a tu futuro Node.js (ej: fetch('http://localhost:3000/api/productos'))
    fetch('/productos.json')
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        // 3. Guardamos los datos obtenidos en el estado. ¡React redibuja la pantalla aquí!
        setProductos(datos);
      })
      .catch((error) => console.error("Error cargando los productos:", error));
  }, []); // Los corchetes vacíos aseguran que no se cree un bucle infinito.

  return (
    <section id="section-prodDest">
      <h2 className="titulo-h2">Productos Destacados</h2>
      
      <section id="sec-prod-dest" className="sec-prod-dest">
        
        {productos.length === 0 ? (
          <p>Cargando catálogo...</p>
        ) : (
          productos.map((prod) => (
            // Llamamos a la tarjeta, pasándole el objeto completo y su Key obligatoria
            <ProductoCard key={prod.id} producto={prod} />
          ))
        )}
        
      </section>
    </section>
  );
  */}