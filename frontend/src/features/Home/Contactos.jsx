import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function Contactos(){
    return (<>
        {/* Seccion de contacto */}
            <article className="contacto" id="contacto">
                <div className="contacto-contenedor">
                    <div className="contacto-info-general">     
                        <h2>Comunicate con nosotros</h2>
                    </div>

                    <div className="contacto-metodos">
                        {/* WhatsApp */}
                        <a className="contactos wsp" href="https://wa.me/5492664238128?text=Hola,%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n" target="_blank" rel="noopener noreferrer">
                            <div className="contacto-icono">
                                <FaWhatsapp />
                            </div>
                            <div className="contacto-detalle">
                                <span className="contacto-etiqueta">WhatsApp Directo</span>
                                <span className="contacto-valor">+54 9 2664238128</span>
                            </div>
                        </a>

                        {/* Correo Electrónico */}
                        <a className="contactos mail" href="mailto:info@lafe.com">
                            <div className="contacto-icono">
                                <FaEnvelope />
                            </div>
                            <div className="contacto-detalle">
                                <span className="contacto-etiqueta">Correo Electrónico</span>
                                <span className="contacto-valor">info@lafe.com</span>
                            </div>
                        </a>

                        {/* Ubicacion */}
                        <a className="contactos ubicacion" href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                            <div className="contacto-icono">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="contacto-detalle">
                                <span className="contacto-etiqueta">Ubicación</span>
                                <span className="contacto-valor">Juan Gilberto Funes 460, San Luis</span>
                            </div>
                        </a>
                    </div>
                </div>
            </article>
    </>)
}

export default Contactos;