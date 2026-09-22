import iconoNosotros from '../../../assets/Items/iconoNosotros.svg';
import iconoTrigo from '../../../assets/Items/iconoTrigo.svg';
import iconoStock from '../../../assets/Items/iconoStock.svg';



function BienvenidosHome(){
    return(<>
        {/* Tarjetas de bienvenida en Home */}
            <div className="inicio-content">
                <h2 id="titulo-inicio">Bienvenidos a LaFe Distribuidora</h2>
                <div className="cuadrados">
                    <div className="cuadrado">
                        <div className="cuadrado-icono">
                                <img src={iconoNosotros} alt="Quienes somos"/>
                        </div>
                        <h3>¿Quiénes somos?</h3>
                        <p>Somos distribuidora LaFe</p>
                    </div>

                    <div className="cuadrado">
                        <div className="cuadrado-icono">
                                <img src={iconoTrigo} alt="Productos"/>
                        </div>
                        <h3>¿Qué ofrecemos?</h3>
                        <p>Ofrecemos insumos de panaderia</p>
                    </div>

                    <div className="cuadrado">
                        <div className="cuadrado-icono">
                                <img src={iconoStock} alt="Stock"/>
                        </div>
                        <h3>Tu stock garantizado</h3>
                        <p>Siempre tenemos lo que necesitas</p>
                    </div>
                </div>
            </div>
    </>);
}

export default BienvenidosHome;