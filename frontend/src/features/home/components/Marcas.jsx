import marcaArcor from '../../../assets/marcas/marcaArcor.webp';
import marcaEmeth from '../../../assets/marcas/marcaEmeth.webp';
import marcaLedevit from '../../../assets/marcas/marcaLedevit.png';
import marcaLheritier from '../../../assets/marcas/marcaLheritier.png';
import marcaMapsa from '../../../assets/marcas/marcaMapsa.png';
import marcaRichs from '../../../assets/marcas/marcaRichs.png';

function Marcas(){
    return (
    <>
        {/* Marcas asociadas */}
            <section className="nuestras-marcas">
                <h2 id="nuestras-marcas-titulo">Nuestras Marcas</h2>
                <div className="carrusel-contenedor">   
                    <button className="btn-carrusel" id="btn-izq">◄</button>
                    <div className="imagenes-marcas" id="pista-marcas">
                        <img src={marcaArcor} alt="arcor"/>
                        <img src={marcaEmeth} alt="emeth"/>
                        <img src={marcaMapsa} alt="mapsa"/>
                        <img src={marcaLedevit} alt="levedit"/>
                        <img src={marcaRichs} alt="richs"/>
                        <img src={marcaLheritier} alt="lheritier"/>
                    </div>                              
                    <button className="btn-carrusel" id="btn-der">►</button>
                </div>
            </section>
    </>);
}

export default Marcas;