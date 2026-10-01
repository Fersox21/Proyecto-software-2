import iconoNosotros from '../../../assets/Items/iconoNosotros.svg';
import iconoTrigo from '../../../assets/Items/iconoTrigo.svg';
import iconoStock from '../../../assets/Items/iconoStock.svg';
import '../../../styles/estilos.css'; 


function BienvenidosHome(){
    const tarjetas = [
    {
      id: 1,
      titulo: 'Materia prima de primera',
      descripcion:
        'Bolsas de harinas, 000, 0000, premezclas, pastas y granos',
      imagen:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj2dFXPvJS88VIkTyyfDTIIO37n7CS3KEE8WhBdYLzhoZVGPaFPGj0lmEb&s=10',
      alt: 'materia prima',
    },
    {
      id: 2,
      titulo: 'Stock garantizado',
      descripcion:
        'Te garantizamos stock continuo para que no frenes tu produccion. Contamos con un amplio stock de productos de panadería y pastelería.',
      imagen:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS91OcutmnkHcWF4Cnkf4EqZmDjYkw2hnKmIip7nH215hu-RzptUlUuwVg&s=10',
      alt: 'un pan',
    },
    {
      id: 3,
      titulo: 'Reparto directo al local',
      descripcion:
        'Organizamos el pedido por WhatsApp y te lo bajamos en la puerta de tu negocio según tu zona, sin vueltas ni demoras.',
      imagen:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAp8heroBqDiUO3K3uJDqwC06DqhVPsDqlWYyXaLnjjlVak_0pl_2Bg9to&s=10',
      alt: 'deposito',
    },
  ]

    return(<>
        
           <section className="seccion-bienvenidos">
      <div className="bienvenidos-titulo">
        <h2>Abastecimiento confiable para tu negocio</h2>
        <p>
          Acompañamos a panaderías, confiterías y fábricas gastronómicas con materia prima de calidad y entregas directas.
        </p>
      </div>

      <div className="grilla-fotos">
        {tarjetas.map((tarjeta) => (
          <article key={tarjeta.id} className="card-foto">
            <div className="card-img-box">
              <img src={tarjeta.imagen} alt={tarjeta.alt} />
            </div>
            <div className="card-cuerpo">
              <h3>{tarjeta.titulo}</h3>
              <p>{tarjeta.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
    </>);
}

export default BienvenidosHome;