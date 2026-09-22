function PreguntasFrecuentes() {
    return (<>
        <h2>Preguntas Frecuentes</h2>
        
        <ol>
            <li><a href="#zonas-envio">¿A qué zonas envían mercadería?</a></li>
            <li><a href="#medios-pago">¿Cuáles son los medios de pago?</a></li>
            <li><a href="#compras-mayoristas">¿Hay un mínimo para compras mayoristas?</a></li>
        </ol>

        <section className="respuestas">
            <h2 id="zonas-envio">1. Zonas de envío</h2>
            <p>Hacemos envíos diarios a panaderías de toda la provincia...</p>

            <h2 id="medios-pago">2. Medios de pago</h2>
         <p>Aceptamos transferencias y efectivo...</p>


            <h2 id="compras-mayoristas">3. Compras Mayoristas</h2>
            <p>El mínimo de compra por mayor es de 5 bolsas de harina de 50kg...</p>
        </section>
    </>);
}

export default PreguntasFrecuentes;