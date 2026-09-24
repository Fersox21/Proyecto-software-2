import { useState } from 'react'; 
import '../../../styles/preguntasFrecuentes.css';

function PreguntasFrecuentesPage() {


    return (<>

     <section className="preguntas-content">
            <div className="faq-header">
                <h2>Preguntas Frecuentes</h2>
                <p>Resolvemos tus dudas para que puedas realizar tus pedidos de mercadería de forma rápida y sencilla.</p>
            </div>
            
            <div className="faq-grid">
                <article className="faq-card">
                    <h3>¿A qué zonas envían mercadería?</h3>
                    <div className="faq-answer">
                        <p>Hacemos envíos diarios a panaderías de toda la provincia. Contamos con logística propia para asegurar que la materia prima llegue en óptimas condiciones.</p>
                    </div>
                </article>

                <article className="faq-card">
                    <h3>¿Cuáles son los medios de pago?</h3>
                    <div className="faq-answer">
                        <p>Aceptamos transferencias bancarias y pagos en efectivo al momento de la entrega. Para cuentas corrientes, por favor contactar al sector de administración.</p>
                    </div>
                </article>

                <article className="faq-card">
                    <h3>¿Hay un mínimo para compras mayoristas?</h3>
                    <div className="faq-answer">
                        <p>Sí, el mínimo de compra por mayor es de 5 bolsas de harina de 50kg o su equivalente en otros productos del catálogo de la distribuidora.</p>
                    </div>
                </article>
            </div>
        </section>
        
    </>);
}

export default PreguntasFrecuentesPage;