import marcaArcor from '../../../assets/Marcas/marcaArcor.webp';
import marcaEmeth from '../../../assets/Marcas/marcaEmeth.webp';
import marcaLedevit from '../../../assets/Marcas/marcaLedevit.png';
import marcaLheritier from '../../../assets/Marcas/marcaLheritier.png';
import marcaMapsa from '../../../assets/Marcas/marcaMapsa.png';
import marcaRichs from '../../../assets/Marcas/marcaRichs.png';

function Marcas(){
    return (
    <>
        {/* Marcas asociadas */}
            <section className="nuestras-marcas">
                <div className="nuestras-marcas-titulo">
                    <h2>Nuestras Marcas</h2>
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
                </div>
            </section>
    </>);
}

export default Marcas;