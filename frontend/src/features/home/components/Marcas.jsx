import { useRef } from 'react';
import marcaArcor from '../../../assets/marcas/marcaArcor.webp';
import marcaEmeth from '../../../assets/marcas/marcaEmeth.webp';
import marcaLedevit from '../../../assets/marcas/marcaLedevit.png';
import marcaLheritier from '../../../assets/marcas/marcaLheritier.png';
import marcaMapsa from '../../../assets/marcas/marcaMapsa.png';
import marcaRichs from '../../../assets/marcas/marcaRichs.png';

const MARCAS_DATA = [
  { id: 'arcor', nombre: 'Arcor', imagen: marcaArcor },
  { id: 'emeth', nombre: 'Emeth', imagen: marcaEmeth },
  { id: 'mapsa', nombre: 'Mapsa', imagen: marcaMapsa },
  { id: 'ledevit', nombre: 'Ledevit', imagen: marcaLedevit },
  { id: 'richs', nombre: 'Richs', imagen: marcaRichs },
  { id: 'lheritier', nombre: 'Lheritier', imagen: marcaLheritier },
];

function Marcas() {
 const pistaRef = useRef(null);

  const scroll = (direccion) => {
    pistaRef.current?.scrollBy({
      left: direccion === 'izq' ? -250 : 250,
      behavior: 'smooth'
    });
  };

  return (
    <section className="nuestras-marcas">
      <h2 id="nuestras-marcas-titulo">Nuestras Marcas</h2>

      <div className="carrusel-contenedor">
        <button
          className="btn-carrusel"
          id="btn-izq"
          onClick={() => scroll('izq')}
          aria-label="Desplazar a la izquierda"
        >
          ◄
        </button>

        <div className="imagenes-marcas" id="pista-marcas" ref={pistaRef}>
          {MARCAS_DATA.map((marca) => (
            <img key={marca.id} src={marca.imagen} alt={marca.nombre} />
          ))}
        </div>

        <button
          className="btn-carrusel"
          id="btn-der"
          onClick={() => scroll('der')}
          aria-label="Desplazar a la derecha"
        >
          ►
        </button>
      </div>
    </section>
  );
}

export default Marcas;