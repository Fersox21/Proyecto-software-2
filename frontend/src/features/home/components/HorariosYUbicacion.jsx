import { FaRegClock, FaWhatsapp, FaRegEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { HiArrowUpRight } from 'react-icons/hi2';

function HorariosYUbicacion(){
    return (<>
        {/* Horarios y ubicacion en mapa */}
            <section className="section-horarios-mapa">
                <div className="horarios-mapa">
                    
                    {/* Tarjeta de Información y Horarios */}
                    <div className="horarios-info">
                        <p className="horarios-subtitulo">CONTACTO</p>
                        <h2 className="horarios-titulo">
                            Comunicate <br/> con nosotros
                        </h2>
                        <p className="horarios-descripcion">Hacé tu pedido, consultá precios o acercate a retirar directamente en nuestro depósito.</p>
                        
                        {/* Tarjetas de contacto */}
                        <div className="contacto-metodos">
                            {/* WhatsApp */}
                            <a className="contactos wsp" href="https://wa.me/5492664238128?text=Hola,%20quisiera%20recibir%20m%C3%A1s%20informaci%C3%B3n" target="_blank" rel="noopener noreferrer">
                                <div className="contenedor-horarios">
                                    <div className="contacto-icono">
                                        <FaWhatsapp />
                                    </div>
                                    <div className="contacto-detalle">
                                        <span className="contacto-etiqueta">WHATSAPP</span>
                                        <span className="contacto-valor">+54 9 2664 23-8128</span>
                                    </div>
                                </div>
                                <span className="contacto-flecha"><HiArrowUpRight /></span>
                                
                            </a>

                            {/* Correo Electrónico */}
                            <a className="contactos mail" href="mailto:info@lafe.com">
                                <div className="contenedor-horarios">
                                    <div className="contacto-icono">
                                        <FaRegEnvelope />
                                    </div>
                                    <div className="contacto-detalle">
                                        <span className="contacto-etiqueta">CORREO ELECTRÓNICO</span>
                                        <span className="contacto-valor">info@lafe.com</span>
                                    </div>
                                </div>
                                <span className="contacto-flecha"><HiArrowUpRight /></span>

                            </a>

                            {/* Ubicacion */}
                            <a className="contactos ubicacion" href="https://maps.app.goo.gl/CwepvbVbgh7MhPcr7" target="_blank" rel="noopener noreferrer">
                                <div className="contenedor-horarios">
                                    <div className="contacto-icono">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="contacto-detalle">
                                        <span className="contacto-etiqueta">DEPÓSITO</span>
                                        <span className="contacto-valor">Juan Gilberto Funes 460, San Luis</span>
                                    </div>
                                </div>
                                <span className="contacto-flecha"><HiArrowUpRight /></span>
                            </a>
                        </div>
                        
                        
                        
                        <h3 className="horarios"><FaRegClock /> HORARIOS DE ATENCIÓN</h3>
                        <ul className="lista-horarios">
                            <li>
                                <span className="dia">Lunes a Viernes</span>
                                <span className="hora">8:00 AM - 6:00 PM</span>
                            </li>
                            <li>
                                <span className="dia">Sábados</span>
                                <span className="hora">9:00 AM - 12:00 PM</span>
                            </li>
                            <li>
                                <span className="dia">Domingos</span>
                                <span className="hora horarios-cerrado">Cerrado</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contenedor del Mapa */}
                    <div className="contenedor-mapa">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.350071783576!2d-66.3308627243564!3d-33.309662290315806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43c06d20f3dbd%3A0xaede0d4699ac5392!2sLa%20Fe%20Distribuidora!5e0!3m2!1ses!2sar!4v1788628854783!5m2!1ses!2sar" 
                            allowFullScreen="" loading="lazy" referrerPolicy="strict-origin-when-cross-origin">
                        </iframe>
                    </div>
                </div>
            </section>
    </>);
}

export default HorariosYUbicacion;