import { useState } from 'react'; 
import '../../../styles/preguntasFrecuentes.css';

function PreguntasFrecuentesPage() {

    const [preguntaActiva, setPreguntaActiva] = useState(null);

    // Interceptamos el click para evitar el scroll y actualizar el estado
    const handleClick = (e, id) => {
        // 1. Evitamos que el navegador salte al fondo por defecto
        e.preventDefault(); 
        
        // 2. Actualizamos el estado para la animación CSS
        setPreguntaActiva(id); 
        
        // 3. Buscamos la respuesta correspondiente por su ID en el DOM
        const elementoRespuesta = document.getElementById(id);
        
        if (elementoRespuesta) {
            // 4. Ejecutamos el DESPLAZAMIENTO SUAVE
            elementoRespuesta.scrollIntoView({ 
                behavior: 'smooth', // La clave de la suavidad
                block: 'center'      // Alinea la respuesta arriba
            });
        }
    };

    return (<>

     <section class="preguntas-content">
        <h2>Preguntas Frecuentes</h2>
        
        
        <ol>
                <li>
                    <a href="#zonas-envio" onClick={(e) => handleClick(e, 'zonas-envio')}>
                        ¿A qué zonas envían mercadería?
                    </a>
                </li>
                <li>
                    <a href="#medios-pago" onClick={(e) => handleClick(e, 'medios-pago')}>
                        ¿Cuáles son los medios de pago?
                    </a>
                </li>
                <li>
                    <a href="#compras-mayoristas" onClick={(e) => handleClick(e, 'compras-mayoristas')}>
                        ¿Hay un mínimo para compras mayoristas?
                    </a>
                </li>
            </ol>

        


        <section className="respuestas">
                {/* Aplicamos la clase 'activo' si el ID coincide con el estado */}
                <h2 id="zonas-envio" className={preguntaActiva === 'zonas-envio' ? 'activo' : ''}>
                    1. Zonas de envío
                </h2>
                <p>Hacemos envíos diarios a panaderías de toda la provincia...</p>

                <h2 id="medios-pago" className={preguntaActiva === 'medios-pago' ? 'activo' : ''}>
                    2. Medios de pago
                </h2>
                <p>Aceptamos transferencias y efectivo...</p>

                <h2 id="compras-mayoristas" className={preguntaActiva === 'compras-mayoristas' ? 'activo' : ''}>
                    3. Compras Mayoristas
                </h2>
                <p>El mínimo de compra por mayor es de 5 bolsas de harina de 50kg...</p>
            </section>
        </section>
        
    </>);
}

export default PreguntasFrecuentesPage;