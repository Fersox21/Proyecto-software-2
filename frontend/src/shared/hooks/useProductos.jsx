import { useState, useEffect } from 'react';

export function useProductos(url) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    fetch(url)
      .then((respuesta) => respuesta.json())
      .then((datos) => {
        setProductos(datos);
        setCargando(false);
      }).catch((error) => {
        console.error("Error obteniendo productos:", error);
        setCargando(false);
      });
  }, [url]);
  return { productos, cargando };
}