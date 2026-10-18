import '../../../styles/home/marcas.css';

function CarruselMarcas() {
    const marcas = [
        "Lheritier", 
        "Arcor", 
        "Emeth", 
        "Mapsa", 
        "Ledevit", 
        "Rich's"
    ];

    return (
        <section className="seccion-marcas">
            <p className="marcas-subtitulo">TRABAJAMOS CON LAS MARCAS LÍDERES DEL RUBRO</p>
            
            <div className="carrusel-marcas-container">
                <div className="degradado-izquierdo"></div>
                <div className="degradado-derecho"></div>

                <div className="carrusel-track">
                {[...marcas, ...marcas, ...marcas].map((marca, index) => (
                    <div className="marca-item" key={index}>
                    {marca}
                    </div>
                ))}
                </div>
            </div>
        </section>
    );
}

export default CarruselMarcas;