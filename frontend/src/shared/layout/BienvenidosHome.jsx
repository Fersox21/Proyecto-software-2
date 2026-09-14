function BienvenidosHome(){
    return(<>
        {/* Tarjetas de bienvenida en Home */}
            <div class="inicio-content">
                <h2 id="titulo-inicio">Bienvenidos a LaFe Distribuidora</h2>
                <div class="cuadrados">
                    <div class="cuadrado">
                        <div class="cuadrado-icono">
                                <img src="frontend\src\assets\Items\nosotros.svg" alt="Quienes somos"/>
                        </div>
                        <h3>¿Quiénes somos?</h3>
                        <p>Somos distribuidora LaFe</p>
                    </div>

                    <div class="cuadrado">
                        <div class="cuadrado-icono">
                                <img src="frontend\src\assets\Items\wheat_24dp_69645B_FILL0_wght400_GRAD0_opsz24.svg" alt="Productos"/>
                        </div>
                        <h3>¿Qué ofrecemos?</h3>
                        <p>Ofrecemos insumos de panaderia</p>
                    </div>

                    <div class="cuadrado">
                        <div class="cuadrado-icono">
                                <img src="frontend\src\assets\Items\stock.svg" alt="Stock"/>
                        </div>
                        <h3>Tu stock garantizado</h3>
                        <p>Siempre tenemos lo que necesitas</p>
                    </div>
                </div>
            </div>
    </>);
}

export default BienvenidosHome;