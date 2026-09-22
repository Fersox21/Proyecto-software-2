import { FaRegClock } from "react-icons/fa";

function HorariosYUbicacion(){
    return (<>
        {/* Horarios y ubicacion en mapa */}
            <section className="section-horarios-mapa">
                <div className="horarios-mapa">
                    
                    {/* Tarjeta de Información y Horarios */}
                    <div className="tarjeta-info">
                        <h3><FaRegClock /> Horarios de Atención</h3>
                        <ul className="lista-horarios">
                            <li>
                                <span className="dia">Lunes a Viernes:</span>
                                <span className="hora">8:00 AM - 6:00 PM</span>
                            </li>
                            <li>
                                <span className="dia">Sábados:</span>
                                <span className="hora">9:00 AM - 12:00 PM</span>
                            </li>
                            <li>
                                <span className="dia">Domingos:</span>
                                <span className="hora">Cerrado</span>
                            </li>
                        </ul>

                        <div className="extra-info">
                            <h4><i className="fas fa-map-marker-alt"></i> Retiro en local</h4>
                            <p>Acercate a retirar tus pedidos directamente en nuestro depósito.</p>
                        </div>
                    </div>

                    {/* Contenedor del Mapa */}
                    <div className="contenedor-mapa">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.350071783576!2d-66.3308627243564!3d-33.309662290315806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43c06d20f3dbd%3A0xaede0d4699ac5392!2sLa%20Fe%20Distribuidora!5e0!3m2!1ses!2sar!4v1788628854783!5m2!1ses!2sar" 
                            allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin">
                        </iframe>
                    </div>
                </div>
            </section>
    </>);
}

export default HorariosYUbicacion;